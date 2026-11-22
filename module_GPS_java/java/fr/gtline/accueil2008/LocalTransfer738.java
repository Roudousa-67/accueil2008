package fr.gtline.accueil2008;

import android.app.Activity;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.NetworkInterface;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * 7.38 : petit serveur HTTP de l'autoradio pour recevoir tickets, GPX et PDF depuis le
 * téléphone, et lui faire télécharger le rapport de diagnostic.
 *
 * - Réseau local uniquement : les connexions venant d'une adresse publique sont refusées.
 * - Chaque QR porte un jeton aléatoire valable 15 minutes ; sans lui, rien n'est accessible.
 * - Fichiers rangés dans le stockage privé de l'appli, 1 Go au maximum. Quand c'est plein,
 *   les fichiers les plus anciens non rattachés (non « gardés ») sont supprimés en premier.
 * - Le contenu est vérifié par sa signature (JPEG, PNG, PDF, GPX), 15 Mo maximum par fichier.
 */
public final class LocalTransfer738 {
    static final int PORT = 8738;
    static final long QUOTA_DEFAULT = 1024L * 1024L * 1024L;
    static final int MAX_FILE = 15 * 1024 * 1024;
    private static final int MAX_HEADER = 16 * 1024;

    private final Activity activity;
    private final WebView web;
    private final File dir;
    private final File keepFile;
    private final SecureRandom random = new SecureRandom();
    private final ExecutorService pool = Executors.newFixedThreadPool(3);
    private volatile ServerSocket server;
    private volatile String token = "";
    private volatile long tokenUntil = 0;
    private volatile String tokenKind = "ticket";
    private volatile String tokenFile = "";
    private volatile String lastError = "";
    private volatile int received = 0;
    private final long QUOTA;

    public LocalTransfer738(Activity activity, WebView web, File baseDir) { this(activity, web, baseDir, QUOTA_DEFAULT); }

    /** Limite réglable pour les essais automatiques ; l'appli utilise toujours 1 Go. */
    LocalTransfer738(Activity activity, WebView web, File baseDir, long quota) {
        this.QUOTA = quota;
        this.activity = activity;
        this.web = web;
        this.dir = new File(baseDir, "transfert738");
        this.keepFile = new File(dir, ".gardes");
        dir.mkdirs();
    }

    // ---------------------------------------------------------------- JavaScript

    @JavascriptInterface public synchronized String start() {
        if (server != null && !server.isClosed()) return status();
        try {
            final ServerSocket s = new ServerSocket();
            s.setReuseAddress(true);
            s.bind(new InetSocketAddress(PORT), 8);
            server = s;
            lastError = "";
            Thread t = new Thread(new Runnable() { @Override public void run() { acceptLoop(s); } }, "transfert738");
            t.setDaemon(true);
            t.start();
        } catch (IOException e) {
            lastError = "Démarrage impossible : " + e.getMessage();
        }
        return status();
    }

    @JavascriptInterface public synchronized String stop() {
        ServerSocket s = server;
        server = null;
        if (s != null) try { s.close(); } catch (IOException ignored) { }
        return status();
    }

    @JavascriptInterface public String status() {
        StringBuilder ips = new StringBuilder("[");
        for (String ip : localAddresses()) { if (ips.length() > 1) ips.append(','); ips.append(q(ip)); }
        ips.append(']');
        long used = used();
        return "{\"native\":true,\"running\":" + (server != null && !server.isClosed())
                + ",\"port\":" + PORT + ",\"ips\":" + ips + ",\"used\":" + used + ",\"quota\":" + QUOTA
                + ",\"files\":" + listFiles().size() + ",\"received\":" + received
                + ",\"tokenValid\":" + (System.currentTimeMillis() < tokenUntil)
                + ",\"error\":" + q(lastError) + "}";
    }

    /** Nouveau jeton (l'ancien devient invalide). kind : ticket, gpx, fichier ou telechargement. */
    @JavascriptInterface public synchronized String newToken(String kind, int minutes, String file) {
        byte[] b = new byte[24];
        random.nextBytes(b);
        StringBuilder s = new StringBuilder();
        for (byte x : b) s.append(String.format(Locale.ROOT, "%02x", x));
        token = s.toString();
        tokenKind = kind == null ? "ticket" : kind;
        tokenFile = file == null ? "" : safeName(file);
        tokenUntil = System.currentTimeMillis() + Math.max(1, Math.min(60, minutes)) * 60000L;
        return token;
    }

    @JavascriptInterface public String list() {
        Set<String> kept = kept();
        StringBuilder out = new StringBuilder("[");
        for (File f : listFiles()) {
            if (out.length() > 1) out.append(',');
            out.append("{\"name\":").append(q(f.getName())).append(",\"size\":").append(f.length())
               .append(",\"time\":").append(f.lastModified()).append(",\"kept\":").append(kept.contains(f.getName())).append('}');
        }
        return out.append(']').toString();
    }

    /** Contenu en data URL, pour une image ou un PDF déjà reçu. */
    @JavascriptInterface public String dataUrl(String name) {
        File f = file(name);
        if (f == null || f.length() > MAX_FILE) return "";
        try { return "data:" + mime(f.getName()) + ";base64," + Base64.encodeToString(read(f), Base64.NO_WRAP); }
        catch (IOException e) { return ""; }
    }

    @JavascriptInterface public String text(String name) {
        File f = file(name);
        if (f == null || f.length() > MAX_FILE) return "";
        try { return new String(read(f), StandardCharsets.UTF_8); } catch (IOException e) { return ""; }
    }

    /** Écrit un fichier produit par l'appli (rapport de diagnostic). */
    @JavascriptInterface public String saveText(String name, String text) {
        String safe = safeName(name);
        if (safe.isEmpty() || text == null) return "{\"ok\":false}";
        byte[] data = text.getBytes(StandardCharsets.UTF_8);
        if (data.length > MAX_FILE || !makeRoom(data.length)) return "{\"ok\":false,\"error\":\"Stockage plein\"}";
        try (FileOutputStream o = new FileOutputStream(new File(dir, safe))) { o.write(data); }
        catch (IOException e) { return "{\"ok\":false,\"error\":" + q(e.getMessage()) + "}"; }
        return "{\"ok\":true,\"path\":" + q(safe) + "}";
    }

    @JavascriptInterface public synchronized boolean remove(String name) {
        File f = file(name);
        if (f == null) return false;
        Set<String> kept = kept(); kept.remove(f.getName()); saveKept(kept);
        return f.delete();
    }

    /** Marque un fichier comme rattaché (jamais supprimé automatiquement) ou non. */
    @JavascriptInterface public synchronized void keep(String name, boolean value) {
        Set<String> kept = kept();
        if (value) kept.add(safeName(name)); else kept.remove(safeName(name));
        saveKept(kept);
    }

    /** Remplace la liste des fichiers gardés (tickets encore rattachés à un plein). */
    @JavascriptInterface public synchronized void keepOnly(String namesJsonLike) {
        Set<String> kept = new HashSet<>();
        if (namesJsonLike != null) for (String n : namesJsonLike.split("\n")) if (!safeName(n).isEmpty()) kept.add(safeName(n));
        saveKept(kept);
    }

    public void release() { stop(); pool.shutdownNow(); }

    // ---------------------------------------------------------------- HTTP

    private void acceptLoop(ServerSocket s) {
        while (!s.isClosed()) {
            try {
                final Socket c = s.accept();
                pool.execute(new Runnable() { @Override public void run() { handle(c); } });
            } catch (IOException e) {
                if (!s.isClosed()) lastError = "Réception interrompue : " + e.getMessage();
            }
        }
    }

    void handle(Socket c) {
        try {
            c.setSoTimeout(30000);
            InetAddress remote = c.getInetAddress();
            InputStream in = c.getInputStream();
            OutputStream out = c.getOutputStream();
            if (!(remote.isSiteLocalAddress() || remote.isLoopbackAddress() || remote.isLinkLocalAddress())) {
                send(out, 403, "text/plain; charset=utf-8", "Réseau local uniquement.".getBytes(StandardCharsets.UTF_8), null);
                return;
            }
            String head = readHead(in);
            if (head == null) { send(out, 400, "text/plain; charset=utf-8", "Requête invalide.".getBytes(StandardCharsets.UTF_8), null); return; }
            String[] lines = head.split("\r\n");
            String[] first = lines[0].split(" ");
            if (first.length < 2) { send(out, 400, "text/plain; charset=utf-8", "Requête invalide.".getBytes(StandardCharsets.UTF_8), null); return; }
            String method = first[0], target = first[1], path = target, query = "";
            int qi = target.indexOf('?');
            if (qi >= 0) { path = target.substring(0, qi); query = target.substring(qi + 1); }
            Map<String, String> params = parseQuery(query);
            long length = 0;
            for (String h : lines) if (h.toLowerCase(Locale.ROOT).startsWith("content-length:")) {
                try { length = Long.parseLong(h.substring(15).trim()); } catch (NumberFormatException e) { length = -1; }
            }
            boolean authorised = token.length() > 0 && token.equals(params.get("t")) && System.currentTimeMillis() < tokenUntil;
            if (method.equals("GET") && (path.equals("/") || path.equals("/index.html"))) {
                if (!authorised) { send(out, 403, "text/html; charset=utf-8", expiredPage(), null); return; }
                send(out, 200, "text/html; charset=utf-8", page(), null);
                return;
            }
            if (!authorised) { send(out, 403, "application/json", json(false, "Lien expiré : crée un nouveau QR sur l'autoradio."), null); return; }
            if (method.equals("GET") && path.equals("/etat")) {
                String body = "{\"kind\":" + q(tokenKind) + ",\"file\":" + q(tokenFile) + ",\"expires\":" + tokenUntil + ",\"free\":" + Math.max(0, QUOTA - used()) + "}";
                send(out, 200, "application/json", body.getBytes(StandardCharsets.UTF_8), null);
                return;
            }
            if (method.equals("GET") && path.equals("/fichier")) {
                File f = file(params.get("nom"));
                if (f == null) { send(out, 404, "application/json", json(false, "Fichier introuvable."), null); return; }
                send(out, 200, mime(f.getName()), read(f), "attachment; filename=\"" + f.getName() + "\"");
                return;
            }
            if (method.equals("POST") && path.equals("/envoi")) {
                if (length <= 0 || length > MAX_FILE) { send(out, 413, "application/json", json(false, "Fichier vide ou trop gros (15 Mo maximum)."), null); return; }
                byte[] data = readBody(in, (int) length);
                if (data == null) { send(out, 400, "application/json", json(false, "Envoi incomplet : réessaie."), null); return; }
                String type = detect(data);
                if (type == null) { send(out, 415, "application/json", json(false, "Type de fichier non accepté (photo, GPX ou PDF)."), null); return; }
                String kind = params.containsKey("type") ? params.get("type") : tokenKind;
                if (kind.equals("ticket") && !(type.equals("jpg") || type.equals("png"))) { send(out, 415, "application/json", json(false, "Un ticket doit être une photo."), null); return; }
                if (!makeRoom(data.length)) { send(out, 507, "application/json", json(false, "Stockage de l'autoradio plein."), null); return; }
                String base = safeName(params.containsKey("nom") ? params.get("nom") : kind);
                int dot = base.lastIndexOf('.');
                if (dot > 0) base = base.substring(0, dot);
                if (base.isEmpty()) base = kind;
                String name = new SimpleDateFormat("yyyyMMdd-HHmmss", Locale.ROOT).format(new Date()) + "-" + safeName(kind) + "-" + base + "." + type;
                if (name.length() > 120) name = name.substring(0, 115) + "." + type;
                try (FileOutputStream o = new FileOutputStream(new File(dir, name))) { o.write(data); }
                received++;
                notifyJs("{\"name\":" + q(name) + ",\"kind\":" + q(kind) + ",\"type\":" + q(type) + ",\"size\":" + data.length + "}");
                send(out, 200, "application/json", ("{\"ok\":true,\"name\":" + q(name) + "}").getBytes(StandardCharsets.UTF_8), null);
                return;
            }
            send(out, 404, "application/json", json(false, "Introuvable."), null);
        } catch (IOException e) {
            lastError = "Échange interrompu : " + e.getMessage();
        } finally {
            try { c.close(); } catch (IOException ignored) { }
        }
    }

    private static String readHead(InputStream in) throws IOException {
        ByteArrayOutputStream b = new ByteArrayOutputStream();
        int state = 0;
        while (b.size() < MAX_HEADER) {
            int x = in.read();
            if (x < 0) return null;
            b.write(x);
            state = (x == '\r' && (state == 0 || state == 2)) ? state + 1 : (x == '\n' && (state == 1 || state == 3)) ? state + 1 : 0;
            if (state == 4) return new String(b.toByteArray(), StandardCharsets.ISO_8859_1).trim();
        }
        return null;
    }

    private static byte[] readBody(InputStream in, int length) throws IOException {
        byte[] data = new byte[length];
        int off = 0;
        while (off < length) {
            int n = in.read(data, off, length - off);
            if (n < 0) return null;
            off += n;
        }
        return data;
    }

    private static void send(OutputStream out, int code, String type, byte[] body, String disposition) throws IOException {
        String reason = code == 200 ? "OK" : code == 403 ? "Forbidden" : code == 404 ? "Not Found" : code == 413 ? "Payload Too Large" : code == 415 ? "Unsupported Media Type" : code == 507 ? "Insufficient Storage" : "Bad Request";
        StringBuilder h = new StringBuilder();
        h.append("HTTP/1.1 ").append(code).append(' ').append(reason).append("\r\n")
         .append("Content-Type: ").append(type).append("\r\n")
         .append("Content-Length: ").append(body.length).append("\r\n")
         .append("Cache-Control: no-store\r\nX-Content-Type-Options: nosniff\r\nReferrer-Policy: no-referrer\r\nConnection: close\r\n");
        if (disposition != null) h.append("Content-Disposition: ").append(disposition).append("\r\n");
        h.append("\r\n");
        out.write(h.toString().getBytes(StandardCharsets.UTF_8));
        out.write(body);
        out.flush();
    }

    private static Map<String, String> parseQuery(String query) {
        Map<String, String> m = new HashMap<>();
        for (String part : query.split("&")) {
            if (part.isEmpty()) continue;
            int i = part.indexOf('=');
            try {
                String k = URLDecoder.decode(i < 0 ? part : part.substring(0, i), "UTF-8");
                String v = i < 0 ? "" : URLDecoder.decode(part.substring(i + 1), "UTF-8");
                m.put(k, v);
            } catch (Exception ignored) { }
        }
        return m;
    }

    /** Signature du contenu, indépendante du nom de fichier envoyé. */
    static String detect(byte[] d) {
        if (d.length > 3 && (d[0] & 0xff) == 0xFF && (d[1] & 0xff) == 0xD8 && (d[2] & 0xff) == 0xFF) return "jpg";
        if (d.length > 8 && (d[0] & 0xff) == 0x89 && d[1] == 'P' && d[2] == 'N' && d[3] == 'G') return "png";
        if (d.length > 4 && d[0] == '%' && d[1] == 'P' && d[2] == 'D' && d[3] == 'F') return "pdf";
        String start = new String(d, 0, Math.min(d.length, 2048), StandardCharsets.UTF_8).trim();
        if (start.startsWith("<") && start.contains("<gpx")) return "gpx";
        return null;
    }

    static String mime(String name) {
        String n = name.toLowerCase(Locale.ROOT);
        if (n.endsWith(".jpg")) return "image/jpeg";
        if (n.endsWith(".png")) return "image/png";
        if (n.endsWith(".pdf")) return "application/pdf";
        if (n.endsWith(".gpx")) return "application/gpx+xml";
        if (n.endsWith(".html")) return "text/html; charset=utf-8";
        return "application/octet-stream";
    }

    static String safeName(String name) {
        if (name == null) return "";
        String n = name.replace('\\', '/');
        n = n.substring(n.lastIndexOf('/') + 1).replaceAll("[^A-Za-z0-9._-]", "_");
        while (n.startsWith(".")) n = n.substring(1);
        return n.length() > 120 ? n.substring(n.length() - 120) : n;
    }

    // ---------------------------------------------------------------- stockage

    private File file(String name) {
        String safe = safeName(name);
        if (safe.isEmpty()) return null;
        File f = new File(dir, safe);
        return f.isFile() ? f : null;
    }

    private List<File> listFiles() {
        File[] files = dir.listFiles();
        List<File> out = new ArrayList<>();
        if (files != null) for (File f : files) if (f.isFile() && !f.getName().startsWith(".")) out.add(f);
        Collections.sort(out, (a, b) -> Long.compare(b.lastModified(), a.lastModified()));
        return out;
    }

    private long used() { long n = 0; for (File f : listFiles()) n += f.length(); return n; }

    /** Libère de la place : fichiers non gardés, du plus ancien au plus récent. */
    private synchronized boolean makeRoom(long size) {
        if (size > QUOTA) return false;
        long used = used();
        if (used + size <= QUOTA) return true;
        Set<String> kept = kept();
        List<File> files = listFiles();
        Collections.reverse(files);
        for (File f : files) {
            if (used + size <= QUOTA) break;
            if (kept.contains(f.getName())) continue;
            long len = f.length();
            if (f.delete()) used -= len;
        }
        return used + size <= QUOTA;
    }

    private Set<String> kept() {
        Set<String> s = new HashSet<>();
        if (!keepFile.isFile()) return s;
        try { s.addAll(Arrays.asList(new String(read(keepFile), StandardCharsets.UTF_8).split("\n"))); } catch (IOException ignored) { }
        s.remove("");
        return s;
    }

    private void saveKept(Set<String> kept) {
        try (FileOutputStream o = new FileOutputStream(keepFile)) { o.write(String.join("\n", kept).getBytes(StandardCharsets.UTF_8)); }
        catch (IOException ignored) { }
    }

    private static byte[] read(File f) throws IOException {
        try (InputStream in = new FileInputStream(f)) {
            ByteArrayOutputStream b = new ByteArrayOutputStream((int) Math.min(f.length(), MAX_FILE));
            byte[] buf = new byte[16384];
            int n;
            while ((n = in.read(buf)) > 0) b.write(buf, 0, n);
            return b.toByteArray();
        }
    }

    // ---------------------------------------------------------------- réseau et page

    /** Adresses IPv4 privées de l'autoradio (point d'accès ou Wi-Fi), point d'accès en premier. */
    static List<String> localAddresses() {
        List<String> out = new ArrayList<>();
        try {
            Enumeration<NetworkInterface> all = NetworkInterface.getNetworkInterfaces();
            while (all != null && all.hasMoreElements()) {
                NetworkInterface n = all.nextElement();
                if (!n.isUp() || n.isLoopback()) continue;
                Enumeration<InetAddress> addresses = n.getInetAddresses();
                while (addresses.hasMoreElements()) {
                    InetAddress a = addresses.nextElement();
                    if (a instanceof Inet4Address && a.isSiteLocalAddress()) {
                        String ip = a.getHostAddress();
                        if (ip.startsWith("192.168.43.") || n.getName().startsWith("ap") || n.getName().startsWith("swlan")) out.add(0, ip);
                        else out.add(ip);
                    }
                }
            }
        } catch (Exception ignored) { }
        return out;
    }

    private byte[] page() {
        try (InputStream in = activity.getAssets().open("transfer738-page.html")) {
            ByteArrayOutputStream b = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int n;
            while ((n = in.read(buf)) > 0) b.write(buf, 0, n);
            return b.toByteArray();
        } catch (IOException e) {
            return "<!doctype html><meta charset=utf-8><p>Page d'envoi indisponible.</p>".getBytes(StandardCharsets.UTF_8);
        }
    }

    private static byte[] expiredPage() {
        return ("<!doctype html><html lang=fr><meta charset=utf-8><meta name=viewport content=\"width=device-width,initial-scale=1\">"
                + "<body style=\"font:17px system-ui;padding:24px;color:#14223a\"><h1 style=\"font-size:21px\">Lien expiré</h1>"
                + "<p>Ce QR n'est plus valable. Sur l'autoradio, touche « Nouveau QR » puis scanne-le à nouveau.</p></body></html>").getBytes(StandardCharsets.UTF_8);
    }

    private void notifyJs(final String json) {
        if (web == null) return;
        web.post(new Runnable() { @Override public void run() {
            web.evaluateJavascript("try{window.Transfer738&&Transfer738.onReceived(" + json + ")}catch(e){}", null);
        } });
    }

    private static byte[] json(boolean ok, String message) {
        return ("{\"ok\":" + ok + ",\"error\":" + q(message) + "}").getBytes(StandardCharsets.UTF_8);
    }

    static String q(String s) {
        if (s == null) return "\"\"";
        StringBuilder b = new StringBuilder("\"");
        for (char c : s.toCharArray()) {
            if (c == '"' || c == '\\') b.append('\\').append(c);
            else if (c < 0x20) b.append(String.format(Locale.ROOT, "\\u%04x", (int) c));
            else b.append(c);
        }
        return b.append('"').toString();
    }
}
