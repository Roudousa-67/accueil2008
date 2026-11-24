package fr.gtline.accueil2008;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;

/** 7.43 : lecture du code d'un lanceur (format dex simulé). */
public final class ScanTest {
    static int ok = 0;
    static void check(String what, boolean cond) { if (!cond) throw new AssertionError(what); ok++; System.out.println("OK " + what); }
    public static void main(String[] a) throws Exception {
        ByteArrayOutputStream b = new ByteArrayOutputStream();
        String[] parts = {"Landroid/app/ActivityView;", "startActivity", "com.syu.ms.action.SHOW_NAVI_WINDOW", "android.intent.action.MAIN",
            "setLaunchBounds", "persist.sys.navi.small_window", "com.waze", "com.example.unrelated.thing", "abc"};
        for (String p : parts) { b.write(p.length()); b.write(p.getBytes(StandardCharsets.US_ASCII)); b.write(0); }
        StringScan743 s = new StringScan743();
        s.scan(new ByteArrayInputStream(b.toByteArray()), 1 << 20);
        check("ActivityView repéré", s.hits.containsKey("ActivityView"));
        check("fenêtre libre repérée", s.hits.containsKey("setLaunchBounds"));
        check("Waze cité", s.hits.containsKey("com.waze"));
        check("commande du fabricant (longueur dex retirée)", s.commands.contains("com.syu.ms.action.SHOW_NAVI_WINDOW"));
        check("propriété système du fabricant", s.commands.contains("persist.sys.navi.small_window"));
        check("actions Android ordinaires ignorées", !s.commands.toString().contains("android.intent"));
        check("noms sans rapport ignorés", !s.commands.contains("com.example.unrelated.thing"));
        check("octets comptés", s.bytes == b.size());
        StringScan743 lim = new StringScan743();
        lim.scan(new ByteArrayInputStream(new byte[300000]), 65536);
        check("lecture limitée", lim.bytes <= 131072);
        System.out.println(ok + " contrôles de la recherche de l’affichage réussis.");
    }
}
