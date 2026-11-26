package fr.gtline.accueil2008;

import android.app.Activity;
import android.app.ActivityManager;
import android.app.ActivityOptions;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Point;
import android.graphics.Typeface;
import android.graphics.pdf.PdfDocument;
import android.net.Uri;
import android.hardware.display.DisplayManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.StrictMode;
import android.provider.MediaStore;
import android.provider.Settings;
import android.view.Display;
import android.webkit.JavascriptInterface;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

/**
 * 7.43 : « Rechercher l'affichage ». Fouille l'autoradio pour comprendre comment le lanceur
 * d'origine affiche Waze dans un petit cadre, et ce que notre appli a le droit d'utiliser :
 * modèle et Android, modes de fenêtres, écrans virtuels, droits, root, lanceurs et applis
 * système (lecture de leur code), Waze. Lecture seule : rien n'est modifié sur le poste.
 * Essai : ouvrir une appli en plein écran pour voir si elle passe au-dessus de Waze.
 */
public final class Display743 {

    private static final Pattern RELATED = Pattern.compile("(?i)(^|\\.)(qf|zj)(\\.|$)|hiworld|carplay|zlink|easyconn|autolink|launcher|home|desktop|syu|fyt|topway|tsui|\\.ts\\.|navi|multiwindow|freeform|float|split|carui|carlauncher|systemui|microntek|hct|joying|atoto");
    private static final Pattern PROPS = Pattern.compile("(?i)navi|gps|launcher|home|multi|freeform|window|float|split|fyt|syu|topway|customer|platform|board|model|product|mcu|ui\\.|car|sdk|build\\.version|display");
    private static final String[] PERMS = {
        "android.permission.ACTIVITY_EMBEDDING", "android.permission.MANAGE_ACTIVITY_STACKS", "android.permission.MANAGE_ACTIVITY_TASKS",
        "android.permission.INTERNAL_SYSTEM_WINDOW", "android.permission.REORDER_TASKS", "android.permission.START_TASKS_FROM_RECENTS",
        "android.permission.ADD_TRUSTED_DISPLAY", "android.permission.CAPTURE_VIDEO_OUTPUT", "android.permission.SYSTEM_ALERT_WINDOW",
        "android.permission.WRITE_SECURE_SETTINGS", "android.permission.REAL_GET_TASKS", "android.permission.PACKAGE_USAGE_STATS"
    };
    // 7.44 : applis du fabricant QF / ZJ (firmware de l'autoradio) lues en priorité.
    private static final Pattern VENDOR = Pattern.compile("(?i)(^|\\.)(qf|zj)(\\.|$)|hiworld|carplay|launcher");
    private static final long BUDGET_MS = 60000;

    private final Activity activity;
    private volatile boolean running;
    private volatile String step = "";
    private volatile String result = "";

    public Display743(Activity activity) { this.activity = activity; }

    @JavascriptInterface
    public String start() {
        if (running) return "{\"ok\":true,\"running\":true}";
        running = true; result = ""; step = "Démarrage";
        new Thread(new Runnable() {
            @Override public void run() {
                String r;
                try { r = scan().toString(); }
                catch (Throwable t) { r = "{\"erreur\":" + JSONObject.quote(String.valueOf(t)) + "}"; }
                result = r; running = false;
            }
        }, "Display743").start();
        return "{\"ok\":true}";
    }

    @JavascriptInterface
    public String state() {
        try { return new JSONObject().put("running", running).put("step", step).put("result", result).toString(); }
        catch (Throwable t) { return "{}"; }
    }

    /** Ouvre une appli normalement, ou en forçant le plein écran (mode de fenêtre 1). */
    @JavascriptInterface
    public String launch(String pkg, boolean full) { return launchInternal(pkg, full).toString(); }

    private JSONObject launchInternal(String pkg, boolean full) {
        try {
            Intent i = activity.getPackageManager().getLaunchIntentForPackage(pkg);
            if (i == null && "com.android.settings".equals(pkg)) i = new Intent(Settings.ACTION_SETTINGS);
            if (i == null) return new JSONObject().put("ok", false).put("erreur", "appli absente : " + pkg);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            Bundle options = null;
            String how = "normal";
            if (full) {
                GpsDock.HiddenApi.exemptAll();
                ActivityOptions o = ActivityOptions.makeBasic();
                try {
                    Method m = ActivityOptions.class.getMethod("setLaunchWindowingMode", int.class);
                    m.invoke(o, 1);
                    how = "plein écran demandé";
                } catch (Throwable t) { how = "plein écran refusé par Android : " + t.getClass().getSimpleName(); }
                options = o.toBundle();
            }
            startOnUi(i, options);
            return new JSONObject().put("ok", true).put("mode", how);
        } catch (Throwable t) {
            try { return new JSONObject().put("ok", false).put("erreur", String.valueOf(t)); } catch (Throwable x) { return new JSONObject(); }
        }
    }

    /**
     * 7.44 : essai « Waze hors de l'écran » : relance l'appli en fenêtre libre (mode 5) avec un cadre
     * placé à droite, hors de l'écran visible. Si Android accepte, la fenêtre existe mais ne se voit plus.
     */
    @JavascriptInterface
    public String launchOffscreen(String pkg) { return launchOffscreenInternal(pkg).toString(); }

    private JSONObject launchOffscreenInternal(String pkg) {
        try {
            Intent i = activity.getPackageManager().getLaunchIntentForPackage(pkg);
            if (i == null) return new JSONObject().put("ok", false).put("erreur", "appli absente : " + pkg);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            Point size = new Point();
            activity.getWindowManager().getDefaultDisplay().getRealSize(size);
            GpsDock.HiddenApi.exemptAll();
            ActivityOptions o = ActivityOptions.makeBasic();
            String how = "cadre hors écran demandé";
            try { Method m = ActivityOptions.class.getMethod("setLaunchWindowingMode", int.class); m.invoke(o, 5); }
            catch (Throwable t) { how += " (mode fenêtre libre refusé : " + t.getClass().getSimpleName() + ")"; }
            o.setLaunchBounds(new android.graphics.Rect(size.x + 40, 0, size.x + 440, 300));
            startOnUi(i, o.toBundle());
            return new JSONObject().put("ok", true).put("mode", how + " (écran " + size.x + "x" + size.y + ")");
        } catch (Throwable t) {
            try { return new JSONObject().put("ok", false).put("erreur", String.valueOf(t)); } catch (Throwable x) { return new JSONObject(); }
        }
    }

    // startActivity sur le fil principal (une séquence tourne sur un fil de travail).
    private void startOnUi(final Intent i, final Bundle options) {
        activity.runOnUiThread(new Runnable() { @Override public void run() {
            try { activity.startActivity(i, options); } catch (Throwable t) { /* refus géré par l'appelant */ }
        } });
    }

    static final String COMPANION = "fr.gtline.accueil2008.masque";

    /** 7.49 : l'appli compagnon est-elle installée ? */
    @JavascriptInterface
    public boolean hasCompanion() {
        try { activity.getPackageManager().getPackageInfo(COMPANION, 0); return true; } catch (Throwable t) { return false; }
    }

    /**
     * 7.49 : cache Waze avec l'appli compagnon. Le système du fabricant (QF) range la fenêtre GPS quand une AUTRE
     * appli passe devant en plein écran ; une page de l'accueil lui-même ne suffit pas (essais des 7.46 à 7.48).
     * L'écran noir de la compagnon se ferme seul ; par sécurité l'accueil se remet ensuite devant.
     */
    @JavascriptInterface
    public String hideViaCompanion() {
        try {
            Intent i = new Intent("fr.gtline.accueil2008.MASQUER").setPackage(COMPANION)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_NO_ANIMATION).putExtra("ms", 350L);
            if (i.resolveActivity(activity.getPackageManager()) == null)
                return new JSONObject().put("ok", false).put("erreur", "appli compagnon absente").toString();
            GpsDock.HiddenApi.exemptAll();
            ActivityOptions o = ActivityOptions.makeBasic();
            try { Method m = ActivityOptions.class.getMethod("setLaunchWindowingMode", int.class); m.invoke(o, 1); } catch (Throwable t) { /* mode par défaut */ }
            startOnUi(i, o.toBundle());
            new Thread(new Runnable() { @Override public void run() { sleep(750); bringSelfToFront(); } }, "Masque743").start();
            return new JSONObject().put("ok", true).toString();
        } catch (Throwable t) {
            return "{\"ok\":false,\"erreur\":" + JSONObject.quote(String.valueOf(t)) + "}";
        }
    }

    /** 7.47 : cache Waze en ouvrant la page invisible SettingsVoiceActivity en plein écran (voir celle-ci). */
    @JavascriptInterface
    public String hideNav() {
        try {
            Intent i = new Intent(activity, SettingsVoiceActivity.class).putExtra("hideNav746", true)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_MULTIPLE_TASK | Intent.FLAG_ACTIVITY_NO_ANIMATION);
            GpsDock.HiddenApi.exemptAll();
            ActivityOptions o = ActivityOptions.makeBasic();
            String how = "plein écran demandé";
            try { Method m = ActivityOptions.class.getMethod("setLaunchWindowingMode", int.class); m.invoke(o, 1); }
            catch (Throwable t) { how = "plein écran refusé : " + t.getClass().getSimpleName(); }
            startOnUi(i, o.toBundle());
            return new JSONObject().put("ok", true).put("mode", how).toString();
        } catch (Throwable t) {
            return "{\"ok\":false,\"erreur\":" + JSONObject.quote(String.valueOf(t)) + "}";
        }
    }

    /** 7.46 : remet l'accueil au premier plan ; la fenêtre libre de Waze passe derrière (vidéo du 25/11). */
    @JavascriptInterface
    public String front() { bringSelfToFront(); return "{\"ok\":true}"; }

    // Ramène notre appli au premier plan entre deux essais (sans droit spécial : nos propres tâches).
    private void bringSelfToFront() {
        try {
            ActivityManager am = (ActivityManager) activity.getSystemService(Context.ACTIVITY_SERVICE);
            for (ActivityManager.AppTask t : am.getAppTasks()) { t.moveToFront(); break; }
        } catch (Throwable t) { /* sans effet */ }
    }

    /**
     * 7.44 : tout d'un coup. La recherche, puis les quatre essais enchaînés tout seuls (entre chaque,
     * on revient au premier plan). L'utilisateur filme l'écran avec son téléphone ; rien à toucher.
     */
    @JavascriptInterface
    public String startAll(final String appPkg, final String navPkg) {
        if (running) return "{\"ok\":true,\"running\":true}";
        running = true; result = ""; step = "Démarrage";
        new Thread(new Runnable() { @Override public void run() {
            String r;
            try {
                JSONObject o = scan();
                JSONArray essais = new JSONArray();
                // L'appli ouvre Waze elle-même : l'utilisateur n'a pas à le faire (il ne pourrait plus
                // atteindre l'écran). Chaque essai : ouvrir Waze, le laisser s'afficher, ouvrir l'appli
                // par-dessus selon la méthode, laisser voir, revenir. L'utilisateur filme.
                String[] kinds = { "normal", "plein", "derriere", "horsecran" };
                for (String k : kinds) {
                    step = "Essai : " + k;
                    JSONObject res = new JSONObject().put("essai", k);
                    // 1. Waze à l'écran (hors écran pour le dernier essai).
                    JSONObject waze = "horsecran".equals(k) ? launchOffscreenInternal(navPkg) : launchInternal(navPkg, "derriere".equals(k));
                    sleep(2600);
                    // 2. L'appli d'essai par-dessus.
                    JSONObject app = launchInternal(appPkg, !"normal".equals(k));
                    sleep(3600);
                    // 3. Retour à l'accueil pour voir si Waze est encore là.
                    bringSelfToFront(); sleep(1800);
                    res.put("waze", waze.optBoolean("ok") ? waze.optString("mode") : waze.optString("erreur"));
                    res.put("appli", app.optBoolean("ok") ? app.optString("mode") : app.optString("erreur"));
                    res.put("ok", app.optBoolean("ok"));
                    essais.put(res);
                }
                step = "Retour"; bringSelfToFront(); sleep(500);
                o.put("essais_auto", essais);
                r = o.toString();
            } catch (Throwable t) { r = "{\"erreur\":" + JSONObject.quote(String.valueOf(t)) + "}"; }
            result = r; running = false; step = "Terminé";
        } }, "Display743All").start();
        return "{\"ok\":true}";
    }

    private static void sleep(long ms) { try { Thread.sleep(ms); } catch (InterruptedException e) { /* ignore */ } }

    /**
     * Fabrique un PDF du résultat, l'enregistre dans Téléchargements/Accueil2008 et ouvre le choix
     * de l'appli d'envoi (Gmail…) avec le PDF en pièce jointe.
     */
    @JavascriptInterface
    public String sharePdf(String name, String title, String text) { return sharePdf(name, title, text, ""); }

    @JavascriptInterface
    public String sharePdf(String name, String title, String text, String email) {
        String where = "";
        try {
            byte[] pdf = makePdf(title, text);
            String file = String.valueOf(name).replaceAll("[^A-Za-z0-9._-]", "_");
            if (!file.endsWith(".pdf")) file += ".pdf";
            Uri uri;
            if (Build.VERSION.SDK_INT >= 29) {
                ContentValues v = new ContentValues();
                v.put(MediaStore.MediaColumns.DISPLAY_NAME, file);
                v.put(MediaStore.MediaColumns.MIME_TYPE, "application/pdf");
                v.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/Accueil2008");
                uri = activity.getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                if (uri == null) throw new IOException("Téléchargements inaccessibles");
                OutputStream os = activity.getContentResolver().openOutputStream(uri);
                if (os == null) throw new IOException("écriture impossible");
                try { os.write(pdf); } finally { os.close(); }
                where = "Téléchargements/Accueil2008/" + file;
            } else {
                File dir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), "Accueil2008");
                dir.mkdirs();
                File f = new File(dir, file);
                FileOutputStream fo = new FileOutputStream(f);
                try { fo.write(pdf); } finally { fo.close(); }
                // Android 9 et avant : lien « file:// » vers le PDF, accepté une fois la vérification levée.
                StrictMode.setVmPolicy(new StrictMode.VmPolicy.Builder().build());
                uri = Uri.fromFile(f);
                where = f.getPath();
            }
            Intent send = new Intent(Intent.ACTION_SEND).setType("application/pdf")
                .putExtra(Intent.EXTRA_STREAM, uri).putExtra(Intent.EXTRA_SUBJECT, title);
            if (email != null && email.contains("@")) send.putExtra(Intent.EXTRA_EMAIL, new String[]{ email });
            send.putExtra(Intent.EXTRA_TEXT, "Résultat de la recherche de l'affichage (Accueil 2008), en pièce jointe.")
                .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            if (send.resolveActivity(activity.getPackageManager()) == null)
                return new JSONObject().put("ok", false).put("fichier", where).put("erreur", "aucune appli d'e-mail sur l'autoradio").toString();
            Intent chooser = Intent.createChooser(send, "Envoyer le PDF");
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_GRANT_READ_URI_PERMISSION);
            activity.startActivity(chooser);
            return new JSONObject().put("ok", true).put("fichier", where).put("taille", pdf.length).toString();
        } catch (Throwable t) {
            return "{\"ok\":false,\"fichier\":" + JSONObject.quote(where) + ",\"erreur\":" + JSONObject.quote(String.valueOf(t)) + "}";
        }
    }

    static byte[] makePdf(String title, String text) throws IOException {
        final int W = 595, H = 842, M = 36;
        PdfDocument doc = new PdfDocument();
        Paint head = new Paint(Paint.ANTI_ALIAS_FLAG); head.setTextSize(13f); head.setFakeBoldText(true);
        Paint body = new Paint(Paint.ANTI_ALIAS_FLAG); body.setTypeface(Typeface.MONOSPACE); body.setTextSize(7.6f);
        List<String> lines = new ArrayList<>();
        for (String raw : String.valueOf(text).split("\n", -1)) {
            String rest = raw;
            do {
                int n = rest.isEmpty() ? 0 : body.breakText(rest, true, W - 2 * M, null);
                if (n < rest.length()) { int sp = rest.lastIndexOf(' ', n); if (sp > n / 2) n = sp + 1; }
                if (n <= 0 && !rest.isEmpty()) n = 1;
                lines.add(rest.substring(0, n));
                rest = rest.substring(n);
            } while (!rest.isEmpty());
        }
        PdfDocument.Page page = null; Canvas cv = null; float y = 0; int no = 0;
        for (String line : lines) {
            if (page == null || y > H - M) {
                if (page != null) doc.finishPage(page);
                page = doc.startPage(new PdfDocument.PageInfo.Builder(W, H, ++no).create());
                cv = page.getCanvas(); y = M + 10;
                cv.drawText(title + (no > 1 ? " (page " + no + ")" : ""), M, y, head); y += 18;
            }
            cv.drawText(line, M, y, body); y += 9.6f;
        }
        if (page != null) doc.finishPage(page);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        doc.writeTo(out); doc.close();
        return out.toByteArray();
    }

    private JSONObject scan() throws Exception {
        long t0 = System.currentTimeMillis();
        PackageManager pm = activity.getPackageManager();
        String me = activity.getPackageName();
        JSONObject o = new JSONObject();

        step = "Modèle et Android";
        o.put("poste", new JSONObject().put("fabricant", Build.MANUFACTURER).put("marque", Build.BRAND).put("modele", Build.MODEL)
            .put("appareil", Build.DEVICE).put("produit", Build.PRODUCT).put("carte", Build.BOARD).put("materiel", Build.HARDWARE)
            .put("android", Build.VERSION.RELEASE).put("sdk", Build.VERSION.SDK_INT).put("build", Build.DISPLAY).put("empreinte", Build.FINGERPRINT));
        o.put("proprietes", props());

        step = "Modes de fenêtres";
        ContentResolver cr = activity.getContentResolver();
        o.put("fenetres", new JSONObject()
            .put("fenetre_libre", pm.hasSystemFeature("android.software.freeform_window_management"))
            .put("image_dans_image", pm.hasSystemFeature("android.software.picture_in_picture"))
            .put("ecrans_secondaires", pm.hasSystemFeature("android.software.activities_on_secondary_displays"))
            .put("reglage_fenetre_libre", global(cr, "enable_freeform_support"))
            .put("forcer_redimension", global(cr, "force_resizable_activities"))
            .put("options_developpeur", global(cr, "development_settings_enabled"))
            .put("ActivityView", exists("android.app.ActivityView"))
            .put("TaskOrganizer", exists("android.window.TaskOrganizer"))
            .put("superposition", Build.VERSION.SDK_INT >= 23 && Settings.canDrawOverlays(activity)));

        step = "Droits de l'appli";
        o.put("appli", rights(pm, me, true));

        step = "Écrans";
        JSONArray screens = new JSONArray();
        DisplayManager dm = (DisplayManager) activity.getSystemService(Context.DISPLAY_SERVICE);
        if (dm != null) for (Display d : dm.getDisplays()) {
            Point p = new Point(); d.getRealSize(p);
            screens.put(new JSONObject().put("id", d.getDisplayId()).put("nom", d.getName()).put("taille", p.x + "x" + p.y).put("drapeaux", d.getFlags()));
        }
        o.put("ecrans", screens);

        JSONArray su = new JSONArray();
        for (String f : new String[]{"/system/xbin/su", "/system/bin/su", "/sbin/su", "/su/bin/su", "/system/app/Superuser.apk", "/data/adb/magisk"})
            if (new File(f).exists()) su.put(f);
        o.put("root", su);

        step = "Lanceurs";
        Intent home = new Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME);
        ResolveInfo def = pm.resolveActivity(home, PackageManager.MATCH_DEFAULT_ONLY);
        o.put("lanceur_par_defaut", def != null && def.activityInfo != null ? def.activityInfo.packageName + " / " + def.activityInfo.name : "");
        LinkedHashSet<String> targets = new LinkedHashSet<>();
        JSONArray homes = new JSONArray();
        for (ResolveInfo r : pm.queryIntentActivities(home, PackageManager.MATCH_DISABLED_COMPONENTS)) {
            if (r.activityInfo == null) continue;
            homes.put(r.activityInfo.packageName + " / " + r.activityInfo.name + (r.activityInfo.enabled && r.activityInfo.applicationInfo.enabled ? "" : " (désactivé)"));
            if (!r.activityInfo.packageName.equals(me)) targets.add(r.activityInfo.packageName);
        }
        o.put("lanceurs", homes);

        step = "Applis système";
        JSONArray related = new JSONArray();
        List<String> extra = new ArrayList<>();
        JSONArray all = new JSONArray();
        List<String> vendor = new ArrayList<>();
        for (PackageInfo pi : pm.getInstalledPackages(PackageManager.MATCH_DISABLED_COMPONENTS)) {
            boolean sys = system(pi.applicationInfo), off = pi.applicationInfo != null && !pi.applicationInfo.enabled;
            all.put(pi.packageName + (sys ? "" : " [ajoutée]") + (off ? " [désactivée]" : ""));
            if (pi.packageName.equals(me) || !RELATED.matcher(pi.packageName).find()) continue;
            related.put(pi.packageName + (sys ? " (système)" : "") + (off ? " (désactivée)" : ""));
            if (VENDOR.matcher(pi.packageName).find()) vendor.add(pi.packageName);
            else if (sys) extra.add(pi.packageName);
        }
        o.put("applis_liees", related);
        o.put("tous_paquets", all);
        for (String p : vendor) if (targets.size() < 12) targets.add(p);
        if (extra.remove("com.android.systemui")) targets.add("com.android.systemui");
        for (String p : extra) if (targets.size() < 14) targets.add(p);

        step = "Waze";
        o.put("waze", waze(pm));

        JSONArray scans = new JSONArray();
        for (String p : targets) {
            if (System.currentTimeMillis() - t0 > BUDGET_MS) { scans.put(new JSONObject().put("paquet", p).put("saute", "temps dépassé")); continue; }
            step = "Lecture du code : " + p;
            try { scans.put(inspect(pm, p)); }
            catch (Throwable t) { scans.put(new JSONObject().put("paquet", p).put("erreur", String.valueOf(t))); }
        }
        o.put("analyse", scans);
        o.put("duree_ms", System.currentTimeMillis() - t0);
        step = "Terminé";
        return o;
    }

    private JSONObject rights(PackageManager pm, String pkg, boolean self) throws Exception {
        PackageInfo pi = pm.getPackageInfo(pkg, PackageManager.GET_PERMISSIONS);
        JSONObject j = new JSONObject().put("paquet", pkg).put("version", pi.versionName)
            .put("systeme", system(pi.applicationInfo)).put("privilegiee", privileged(pi.applicationInfo)).put("fichier", pi.applicationInfo.sourceDir);
        JSONArray perms = new JSONArray();
        List<String> asked = new ArrayList<>();
        if (pi.requestedPermissions != null) for (String s : pi.requestedPermissions) asked.add(s);
        for (String perm : PERMS) {
            boolean granted = self ? activity.checkCallingOrSelfPermission(perm) == PackageManager.PERMISSION_GRANTED
                                   : pm.checkPermission(perm, pkg) == PackageManager.PERMISSION_GRANTED;
            if (granted || asked.contains(perm)) perms.put(perm.substring(perm.lastIndexOf('.') + 1) + (granted ? " : accordée" : " : demandée, refusée"));
        }
        return j.put("droits", perms);
    }

    private JSONObject inspect(PackageManager pm, String pkg) throws Exception {
        JSONObject j = rights(pm, pkg, false);
        StringScan743 s = new StringScan743();
        JSONArray read = new JSONArray();
        for (File f : codeFiles(pm.getApplicationInfo(pkg, 0).sourceDir)) {
            try {
                if (f.getName().endsWith(".apk")) {
                    ZipFile z = new ZipFile(f);
                    try {
                        Enumeration<? extends ZipEntry> en = z.entries();
                        while (en.hasMoreElements()) {
                            ZipEntry e = en.nextElement();
                            if (!e.getName().endsWith(".dex")) continue;
                            InputStream in = z.getInputStream(e);
                            try { s.scan(in, 80L << 20); } finally { in.close(); }
                            read.put(f.getName() + "!" + e.getName());
                        }
                    } finally { z.close(); }
                } else {
                    InputStream in = new FileInputStream(f);
                    try { s.scan(in, 120L << 20); } finally { in.close(); }
                    read.put(f.getPath());
                }
            } catch (Throwable t) { read.put(f.getPath() + " : illisible (" + t.getClass().getSimpleName() + ")"); }
        }
        return j.put("fichiers_lus", read).put("octets", s.bytes).put("mots", new JSONObject(s.hits)).put("commandes", new JSONArray(s.commands));
    }

    /** L'APK, et le code précompilé à côté (oat/<arch>/*.odex, *.vdex) des applis système. */
    private static List<File> codeFiles(String apk) {
        List<File> out = new ArrayList<>();
        if (apk == null) return out;
        File f = new File(apk);
        out.add(f);
        File oat = new File(f.getParentFile(), "oat");
        File[] arches = oat.listFiles();
        if (arches != null) for (File arch : arches) {
            File[] files = arch.listFiles();
            if (files != null) for (File x : files) if (x.getName().endsWith(".vdex") || x.getName().endsWith(".odex")) out.add(x);
        }
        return out;
    }

    private JSONObject waze(PackageManager pm) throws Exception {
        JSONObject j = new JSONObject();
        Intent launch = pm.getLaunchIntentForPackage("com.waze");
        if (launch == null) return j.put("installee", false);
        ResolveInfo r = pm.resolveActivity(launch, 0);
        PackageInfo pi = pm.getPackageInfo("com.waze", 0);
        j.put("installee", true).put("version", pi.versionName);
        if (r != null && r.activityInfo != null) {
            ActivityInfo ai = r.activityInfo;
            j.put("activite", ai.name).put("encastrable", (ai.flags & 0x80000000) != 0);
            try { Field f = ActivityInfo.class.getField("resizeMode"); j.put("redimensionnable", f.getInt(ai)); } catch (Throwable t) { j.put("redimensionnable", "inconnu"); }
        }
        return j;
    }

    private static JSONArray props() {
        JSONArray out = new JSONArray();
        Process pr = null;
        try {
            pr = Runtime.getRuntime().exec(new String[]{"getprop"});
            BufferedReader br = new BufferedReader(new InputStreamReader(pr.getInputStream()));
            String line;
            while ((line = br.readLine()) != null && out.length() < 160) if (PROPS.matcher(line).find() && line.length() < 220) out.put(line);
        } catch (Throwable t) { out.put("getprop impossible : " + t.getClass().getSimpleName()); }
        finally { if (pr != null) pr.destroy(); }
        return out;
    }

    private static String global(ContentResolver cr, String name) {
        try { String v = Settings.Global.getString(cr, name); return v == null ? "absent" : v; } catch (Throwable t) { return "illisible"; }
    }

    private static boolean exists(String cls) {
        try { Class.forName(cls); return true; } catch (Throwable t) { return false; }
    }

    private static boolean system(ApplicationInfo ai) {
        return ai != null && (ai.flags & (ApplicationInfo.FLAG_SYSTEM | ApplicationInfo.FLAG_UPDATED_SYSTEM_APP)) != 0;
    }

    private static boolean privileged(ApplicationInfo ai) {
        try { Field f = ApplicationInfo.class.getField("privateFlags"); return (f.getInt(ai) & 8) != 0; }
        catch (Throwable t) { return ai != null && ai.sourceDir != null && ai.sourceDir.contains("/priv-app/"); }
    }
}
