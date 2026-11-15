package fr.gtline.accueil2008;

import android.app.Activity;
import android.app.Application;
import android.app.ActivityManager;
import android.content.ContentProvider;
import android.content.ContentValues;
import android.database.Cursor;
import android.net.Uri;
import android.os.Bundle;
import android.content.pm.PackageManager;
import android.graphics.Rect;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.FrameLayout;

import java.util.HashMap;
import java.util.Map;
import java.lang.reflect.Method;

/**
 * Branche le cadre GPS (GpsDock) sur l'écran d'accueil SANS modifier MainActivity.
 *
 * Android crée ce « provider » au démarrage de l'appli (déclaré dans AndroidManifest.xml).
 * Il surveille l'ouverture de MainActivity, ajoute le cadre natif par-dessus la WebView
 * et donne au JavaScript l'objet window.GpsDock (gpsBounds, gpsVisible, gpsOpen, gpsLast).
 * La 3D et le CAN ne sont pas touchés : MainActivity reste exactement comme avant.
 */
public final class GpsDockInit extends ContentProvider {

    private final Map<Activity, GpsDock> docks = new HashMap<>();

    @Override
    public boolean onCreate() {
        Application app = (Application) getContext().getApplicationContext();
        app.registerActivityLifecycleCallbacks(new Application.ActivityLifecycleCallbacks() {
            @Override public void onActivityPostCreated(Activity a, Bundle b) { attach(a); } // Android 10+
            @Override public void onActivityCreated(final Activity a, Bundle b) {
                // onActivityCreated peut arriver avant setContentView : attendre la fin d'onCreate.
                a.getWindow().getDecorView().post(new Runnable() {
                    @Override public void run() { attach(a); }
                });
            }
            @Override public void onActivityStarted(Activity a) { }
            @Override public void onActivityResumed(final Activity a) {
                a.getWindow().getDecorView().postDelayed(new Runnable() {
                    @Override public void run() { immersive(a); }
                }, 350);
            }
            @Override public void onActivityPaused(Activity a) { }
            @Override public void onActivityStopped(Activity a) { }
            @Override public void onActivitySaveInstanceState(Activity a, Bundle b) { }
            @Override public void onActivityDestroyed(Activity a) {
                GpsDock d = docks.remove(a);
                if (d != null) d.release();
            }
        });
        return true;
    }

    private void attach(Activity a) {
        if (!a.getClass().getName().endsWith(".MainActivity") || docks.containsKey(a)) return;
        View content = a.findViewById(android.R.id.content);
        if (!(content instanceof FrameLayout)) return;
        FrameLayout root = (FrameLayout) content;
        WebView web = findWebView(root);
        if (web == null) return;
        GpsDock dock = new GpsDock(a, root);
        docks.put(a, dock);
        web.addJavascriptInterface(new Js(a, dock, web, root), "GpsDock");
        // Le JavaScript décide quand ouvrir : pas de lancement concurrent au démarrage.
    }

    private static WebView findWebView(View v) {
        if (v instanceof WebView) return (WebView) v;
        if (v instanceof ViewGroup) {
            ViewGroup g = (ViewGroup) v;
            for (int i = 0; i < g.getChildCount(); i++) {
                WebView w = findWebView(g.getChildAt(i));
                if (w != null) return w;
            }
        }
        return null;
    }

    /** Objet visible en JavaScript sous le nom window.GpsDock. */
    static final class Js {
        private final Activity activity;
        private final GpsDock dock;
        private final FrameLayout root;
        private volatile String viewport = "{}";

        Js(Activity activity, GpsDock dock, final WebView web, FrameLayout root) {
            this.activity = activity;
            this.dock = dock;
            this.root = root;
            final Runnable measure = new Runnable() {
                @Override public void run() {
                    int[] origin = new int[2]; web.getLocationOnScreen(origin);
                    viewport = "{\"x\":" + origin[0] + ",\"y\":" + origin[1]
                            + ",\"width\":" + web.getWidth() + ",\"height\":" + web.getHeight() + "}";
                }
            };
            web.getViewTreeObserver().addOnGlobalLayoutListener(new android.view.ViewTreeObserver.OnGlobalLayoutListener() {
                @Override public void onGlobalLayout() { measure.run(); }
            });
            web.post(measure);
        }

        @JavascriptInterface public void settingsVoiceStart() {
            activity.runOnUiThread(new Runnable(){@Override public void run(){
                activity.startActivity(new android.content.Intent(activity,SettingsVoiceActivity.class));
            }});
        }
        @JavascriptInterface public String settingsVoiceResult() {
            return activity.getSharedPreferences("settings_voice",0).getString("result","{}");
        }

        @JavascriptInterface public String gpsViewport() { return viewport; }

        @JavascriptInterface public boolean gpsCanEmbed() {
            int api = android.os.Build.VERSION.SDK_INT;
            return dock.canEmbed() && api >= 29 && api <= 30 && activity.checkSelfPermission("android.permission.ACTIVITY_EMBEDDING") == PackageManager.PERMISSION_GRANTED;
        }

        @JavascriptInterface public void gpsImmersive() {
            activity.runOnUiThread(new Runnable() { @Override public void run() { immersive(activity); } });
        }

        /** Redimensionne une tâche existante quand le firmware a accordé les permissions.
         * Sinon retourne false : le JS utilisera launchIn, sans prétendre avoir déplacé la tâche. */
        @JavascriptInterface public boolean gpsResize(String pkg, int left, int top, int right, int bottom) {
            if (pkg == null || right - left < 60 || bottom - top < 60) return false;
            try {
                GpsDock.HiddenApi.exemptAll();
                ActivityManager am = (ActivityManager) activity.getSystemService(Activity.ACTIVITY_SERVICE);
                int id = -1;
                for (ActivityManager.RunningTaskInfo task : am.getRunningTasks(50)) {
                    if (task.baseActivity != null && pkg.equals(task.baseActivity.getPackageName())) { id = task.id; break; }
                }
                if (id < 0) return false;
                Object service;
                try { service = Class.forName("android.app.ActivityTaskManager").getMethod("getService").invoke(null); }
                catch (Throwable absent) { service = Class.forName("android.app.ActivityManager").getMethod("getService").invoke(null); }
                Rect bounds = new Rect(left, top, right, bottom);
                Method resize = service.getClass().getMethod("resizeTask", int.class, Rect.class, int.class);
                resize.invoke(service, id, bounds, 0);
                return true;
            } catch (Throwable denied) { return false; }
        }

        @JavascriptInterface
        public void gpsBounds(final int x, final int y, final int w, final int h) {
            activity.runOnUiThread(new Runnable() {
                @Override public void run() {
                    int[] origin = new int[2]; root.getLocationOnScreen(origin);
                    dock.setBounds(x - origin[0], y - origin[1], w, h);
                }
            });
        }

        @JavascriptInterface
        public void gpsVisible(final boolean visible) {
            activity.runOnUiThread(new Runnable() {
                @Override public void run() { dock.setVisible(visible); }
            });
        }

        @JavascriptInterface
        public void gpsOpen(final String pkg) {
            activity.runOnUiThread(new Runnable() {
                @Override public void run() { dock.open(pkg); }
            });
        }

        @JavascriptInterface
        public String gpsLast() {
            return dock.last();
        }
    }

    private static void immersive(Activity a) {
        if (!a.getClass().getName().endsWith(".MainActivity")) return;
        if (!a.getSharedPreferences("a08", 0).getBoolean("immersive", true)) return;
        a.getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
    }

    // --- méthodes obligatoires d'un ContentProvider (inutilisées) ---
    @Override public Cursor query(Uri u, String[] p, String s, String[] a, String o) { return null; }
    @Override public String getType(Uri u) { return null; }
    @Override public Uri insert(Uri u, ContentValues v) { return null; }
    @Override public int delete(Uri u, String s, String[] a) { return 0; }
    @Override public int update(Uri u, ContentValues v, String s, String[] a) { return 0; }
}
