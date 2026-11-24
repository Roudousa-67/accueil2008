package fr.gtline.accueil2008;

import java.io.IOException;
import java.io.InputStream;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.TreeSet;
import java.util.regex.Pattern;

/**
 * 7.43 : lecture façon « strings » d'un fichier de code (dex, vdex, odex) pour repérer comment
 * un lanceur affiche une appli dans un cadre : méthodes Android utilisées et commandes propres
 * au fabricant (actions d'intent, propriétés système). Sans dépendance Android : testable seul.
 */
public final class StringScan743 {

    /** Méthodes et classes qui trahissent une façon d'afficher une autre appli dans un cadre. */
    public static final String[] KEYS = {
        "ActivityView", "TaskView", "TaskOrganizer", "TaskEmbedder", "createVirtualDisplay", "VirtualDisplay",
        "setLaunchBounds", "setLaunchWindowingMode", "setLaunchDisplayId", "setTaskWindowingMode",
        "WINDOWING_MODE_FREEFORM", "freeform", "resizeTask", "moveTaskToBack", "moveTaskToFront", "removeTask",
        "startActivityFromRecents", "IActivityTaskManager", "ACTIVITY_EMBEDDING", "MANAGE_ACTIVITY_STACKS",
        "MANAGE_ACTIVITY_TASKS", "SurfaceControl", "SPLIT_SCREEN", "setSplitScreen", "enterPictureInPictureMode",
        "com.waze"
    };

    private static final Pattern DOTTED = Pattern.compile("^[a-z][a-z0-9_]*(\\.[A-Za-z0-9_]+){2,}$");
    private static final Pattern WORDS = Pattern.compile("(?i)navi|map|gps|float|window|small|mini|pip|split|freeform|embed|display|hide|show|launch|desk");
    private static final Pattern COMMON = Pattern.compile("^(android|androidx|java|javax|kotlin|kotlinx|dalvik|org|com\\.google|com\\.android\\.internal)\\.");

    public final Map<String, Integer> hits = new LinkedHashMap<>();
    public final TreeSet<String> commands = new TreeSet<>();
    public long bytes;
    public int maxCommands = 120;

    /** Lit au plus {@code limit} octets ; les suites de caractères imprimables sont examinées une à une. */
    public void scan(InputStream in, long limit) throws IOException {
        byte[] buf = new byte[65536];
        StringBuilder run = new StringBuilder();
        int n;
        while ((n = in.read(buf)) > 0) {
            for (int i = 0; i < n; i++) {
                int b = buf[i] & 0xff;
                if (b >= 0x20 && b < 0x7f) {
                    if (run.length() < 400) run.append((char) b);
                } else {
                    if (run.length() >= 6) check(run.toString());
                    run.setLength(0);
                }
            }
            bytes += n;
            if (bytes >= limit) break;
        }
        if (run.length() >= 6) check(run.toString());
    }

    void check(String s) {
        for (String k : KEYS) if (s.contains(k)) { Integer c = hits.get(k); hits.put(k, c == null ? 1 : c + 1); }
        if (commands.size() >= maxCommands) return;
        // Dans un fichier dex, la longueur de la chaîne précède le texte et peut être un caractère imprimable.
        for (String t : new String[]{s, s.length() > 1 ? s.substring(1) : ""}) {
            if (t.length() >= 8 && t.length() <= 120 && DOTTED.matcher(t).matches() && !COMMON.matcher(t).find() && WORDS.matcher(t).find()) {
                commands.add(t);
                break;
            }
        }
    }
}
