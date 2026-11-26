package fr.gtline.accueil2008.masque;

import android.app.Activity;
import android.os.Bundle;
import android.os.Handler;
import android.view.View;

/** Écran noir plein écran, fermé tout seul après une fraction de seconde (350 ms par défaut, 100 à 2000 ms). */
public final class Masque extends Activity {
    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        overridePendingTransition(0, 0);
        View v = new View(this);
        v.setBackgroundColor(0xFF000000);
        setContentView(v);
        long ms = getIntent() != null ? getIntent().getLongExtra("ms", 350L) : 350L;
        new Handler().postDelayed(new Runnable() {
            @Override public void run() {
                try { finishAndRemoveTask(); } catch (Throwable t) { finish(); }
                overridePendingTransition(0, 0);
            }
        }, Math.max(100L, Math.min(ms, 2000L)));
    }
}
