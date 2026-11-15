package fr.gtline.accueil2008;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.TextView;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

/**
 * Cadre GPS encastré dans le lanceur : une android.app.ActivityView (Android 10 et 11) qui affiche l'appli choisie
 * directement dans l'écran d'accueil.
 *
 * Conditions pour que l'encastrement fonctionne :
 *  - Android 10 (API 29) ou 11 (API 30) : ActivityView n'existe plus à partir d'Android 12 ;
 *  - appli installée dans /system/priv-app avec la permission android.permission.ACTIVITY_EMBEDDING
 *    accordée (fichier privapp-permissions), car Waze et Maps ne déclarent pas allowEmbedded.
 * Sinon : un message explique le refus ; le plein écran reste un choix explicite.
 *
 * Utilisation (dans MainActivity) :
 *   FrameLayout root = new FrameLayout(this);
 *   root.addView(web, new FrameLayout.LayoutParams(-1, -1));
 *   setContentView(root);
 *   gpsDock = new GpsDock(this, root);
 *   gpsDock.autoStart();
 *   ...
 *   onDestroy() : gpsDock.release();
 */
public final class GpsDock {

    public static final String WAZE = "com.waze";
    public static final String MAPS = "com.google.android.apps.maps";

    private static final String TAG = "GpsDock";
    private static final String PREFS = "gps_dock";
    private static final String KEY_LAST = "last_pkg";
    private static final int LAUNCH_FLAGS = Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_MULTIPLE_TASK;
    private static final int RETRY_DELAY_MS = 200;
    private static final int RETRY_MAX = 30;           // 30 x 200 ms = 6 s pour que la vue soit prête
    private static final int AUTOSTART_DELAY_MS = 1500;

    private static final int COLOR_PANEL = 0xF20E1116;
    private static final int COLOR_MUTED = 0xFF9A9BA3;

    private final Activity activity;
    private final FrameLayout root;
    private final Handler ui = new Handler(Looper.getMainLooper());
    private final SharedPreferences prefs;

    private final FrameLayout panel;   // toute la zone du cadre
    private final FrameLayout host;    // reçoit l'ActivityView
    private final TextView hint;

    private View activityView;         // android.app.ActivityView, créée par réflexion
    private Method avStartActivity;    // ActivityView.startActivity(Intent)
    private Method avRelease;          // ActivityView.release()
    private volatile boolean embedUnavailable;  // lu aussi depuis le pont JavaScript

    private Intent pending;            // lancement en attente (vue pas encore prête ou masquée)
    private int retries;
    private boolean released;
    private boolean boundsFromWeb;

    public GpsDock(Activity activity, FrameLayout root) {
        this.activity = activity;
        this.root = root;
        this.prefs = activity.getSharedPreferences(PREFS, Context.MODE_PRIVATE);

        panel = new FrameLayout(activity);
        panel.setBackground(rounded(COLOR_PANEL, dp(18)));
        panel.setClipToOutline(true);

        host = new FrameLayout(activity);
        host.setBackgroundColor(0xFF0A0D12);
        panel.addView(host, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        hint = new TextView(activity);
        hint.setTextColor(COLOR_MUTED);
        hint.setTextSize(TypedValue.COMPLEX_UNIT_SP, 16);
        hint.setGravity(Gravity.CENTER);
        hint.setPadding(dp(16), 0, dp(16), 0);
        hint.setText("GPS");
        host.addView(hint, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        root.addView(panel, new FrameLayout.LayoutParams(1, 1, Gravity.TOP | Gravity.START));
        panel.setVisibility(View.INVISIBLE);
        root.post(new Runnable() {
            @Override public void run() { applyDefaultBounds(); }
        });
    }

    // ------------------------------------------------------------------ API publique

    /** Position et taille de la zone en pixels physiques, relatives au coin haut-gauche de l'écran. */
    public void setBounds(int x, int y, int w, int h) {
        if (released || w <= 0 || h <= 0) return;
        boundsFromWeb = true;
        FrameLayout.LayoutParams lp = (FrameLayout.LayoutParams) panel.getLayoutParams();
        if (lp.leftMargin == x && lp.topMargin == y && lp.width == w && lp.height == h) return;
        lp.leftMargin = x;
        lp.topMargin = y;
        lp.width = w;
        lp.height = h;
        panel.setLayoutParams(lp);
    }

    /** Affiche ou masque le cadre (masqué quand l'écran web n'affiche pas la zone GPS). */
    public void setVisible(boolean visible) {
        if (released) return;
        int v = visible ? View.VISIBLE : View.INVISIBLE;
        if (panel.getVisibility() == v) return;
        panel.setVisibility(v);
        if (visible && pending != null) {
            retries = 0;
            tryStart();
        }
    }

    /** Ouvre l'appli dans le cadre et la mémorise pour le prochain démarrage. */
    public void open(String pkg) {
        if (released || pkg == null || pkg.length() == 0) return;
        prefs.edit().putString(KEY_LAST, pkg).apply();

        Intent launch = activity.getPackageManager().getLaunchIntentForPackage(pkg);
        if (launch == null) {
            showHint(label(pkg) + " n'est pas installée");
            return;
        }
        launch.addFlags(LAUNCH_FLAGS);

        if (!ensureActivityView()) {
            openFullScreen(launch, "Encastrement impossible ici (Android " + Build.VERSION.RELEASE
                    + ") : " + label(pkg) + " ouverte en plein écran");
            return;
        }
        pending = launch;
        retries = 0;
        showHint("Ouverture de " + label(pkg) + "…");
        tryStart();
    }

    /** Dernière appli GPS ouverte (ou chaîne vide). */
    public String last() {
        return prefs.getString(KEY_LAST, "");
    }

    public boolean canEmbed() { return !embedUnavailable; }

    /** Relance automatiquement le dernier GPS ouvert, un peu après le démarrage. */
    public void autoStart() {
        final String pkg = last();
        if (pkg.length() == 0) return;
        ui.postDelayed(new Runnable() {
            @Override public void run() { open(pkg); }
        }, AUTOSTART_DELAY_MS);
    }

    /** À appeler dans onDestroy() de l'activité. */
    public void release() {
        released = true;
        ui.removeCallbacksAndMessages(null);
        pending = null;
        if (activityView != null && avRelease != null) {
            try {
                avRelease.invoke(activityView);
            } catch (Throwable t) {
                Log.w(TAG, "release", t);
            }
        }
        activityView = null;
        root.removeView(panel);
    }

    // ------------------------------------------------------------------ interne

    private boolean ensureActivityView() {
        if (activityView != null) return true;
        if (embedUnavailable) return false;
        if (Build.VERSION.SDK_INT < 29 || Build.VERSION.SDK_INT > 30) {
            embedUnavailable = true;
            return false;
        }
        HiddenApi.exemptAll();
        try {
            Class<?> cls = Class.forName("android.app.ActivityView");
            Constructor<?> ctor = cls.getConstructor(Context.class);
            View v = (View) ctor.newInstance(activity);
            avStartActivity = cls.getMethod("startActivity", Intent.class);
            avRelease = cls.getMethod("release");
            host.addView(v, 0, new FrameLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
            activityView = v;
            return true;
        } catch (Throwable t) {
            Log.w(TAG, "ActivityView indisponible", t);
            embedUnavailable = true;
            return false;
        }
    }

    private void tryStart() {
        if (released || pending == null || activityView == null) return;
        if (panel.getVisibility() != View.VISIBLE) return; // relancé par setVisible(true)
        try {
            avStartActivity.invoke(activityView, pending);
            pending = null;
            hint.setVisibility(View.GONE);
        } catch (InvocationTargetException e) {
            Throwable cause = e.getCause() != null ? e.getCause() : e;
            if (cause instanceof IllegalStateException && retries++ < RETRY_MAX) {
                // la surface virtuelle n'est pas encore créée : on réessaie
                ui.postDelayed(new Runnable() {
                    @Override public void run() { tryStart(); }
                }, RETRY_DELAY_MS);
                return;
            }
            Log.w(TAG, "startActivity refusé", cause);
            Intent i = pending;
            pending = null;
            if (cause instanceof SecurityException) {
                embedUnavailable = true;
                openFullScreen(i, "Permission ACTIVITY_EMBEDDING refusée : installe l'appli dans /system/priv-app");
            } else {
                showHint("Erreur : " + cause.getClass().getSimpleName());
            }
        } catch (Throwable t) {
            Log.w(TAG, "startActivity", t);
            Intent i = pending;
            pending = null;
            openFullScreen(i, "Encastrement impossible : appli ouverte en plein écran");
        }
    }

    private void openFullScreen(Intent i, String why) {
        showHint(why);
        // Le bouton Plein écran reste un choix explicite : un refus natif ne quitte pas l'accueil.
    }

    private void applyDefaultBounds() {
        if (boundsFromWeb || released) return;
        int w = root.getWidth(), h = root.getHeight();
        if (w <= 0 || h <= 0) return;
        int pw = Math.round(w * 0.42f);
        FrameLayout.LayoutParams lp = (FrameLayout.LayoutParams) panel.getLayoutParams();
        lp.leftMargin = w - pw - dp(12);
        lp.topMargin = dp(64);
        lp.width = pw;
        lp.height = h - dp(64) - dp(110);
        panel.setLayoutParams(lp);
    }

    private void showHint(String text) {
        hint.setText(text);
        hint.setVisibility(View.VISIBLE);
        hint.bringToFront();
    }

    private boolean installed(String pkg) {
        try {
            activity.getPackageManager().getApplicationInfo(pkg, 0);
            return true;
        } catch (PackageManager.NameNotFoundException e) {
            return false;
        }
    }

    private String label(String pkg) {
        try {
            PackageManager pm = activity.getPackageManager();
            ApplicationInfo ai = pm.getApplicationInfo(pkg, 0);
            return String.valueOf(pm.getApplicationLabel(ai));
        } catch (PackageManager.NameNotFoundException e) {
            return WAZE.equals(pkg) ? "Waze" : MAPS.equals(pkg) ? "Google Maps" : pkg;
        }
    }

    private GradientDrawable rounded(int color, int radius) {
        GradientDrawable g = new GradientDrawable();
        g.setColor(color);
        g.setCornerRadius(radius);
        return g;
    }

    private int dp(int v) {
        return Math.round(TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v,
                activity.getResources().getDisplayMetrics()));
    }

    /** Lève les restrictions d'API cachées (Android 10/11) pour pouvoir utiliser ActivityView. */
    static final class HiddenApi {
        private static boolean done;

        static void exemptAll() {
            if (done || Build.VERSION.SDK_INT < 28) return;
            done = true;
            try {
                Method forName = Class.class.getDeclaredMethod("forName", String.class);
                Method getDeclaredMethod = Class.class.getDeclaredMethod("getDeclaredMethod", String.class, Class[].class);
                Class<?> vmRuntime = (Class<?>) forName.invoke(null, "dalvik.system.VMRuntime");
                Method getRuntime = (Method) getDeclaredMethod.invoke(vmRuntime, "getRuntime", null);
                Method setExemptions = (Method) getDeclaredMethod.invoke(vmRuntime, "setHiddenApiExemptions",
                        new Class<?>[]{String[].class});
                Object runtime = getRuntime.invoke(null);
                setExemptions.invoke(runtime, new Object[]{new String[]{"L"}});
            } catch (Throwable t) {
                Log.w(TAG, "exemption API cachées impossible (souvent sans conséquence pour une appli système)", t);
            }
        }
    }
}
