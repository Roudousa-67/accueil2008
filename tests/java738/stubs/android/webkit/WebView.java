package android.webkit;
public class WebView { public static java.util.List<String> scripts=new java.util.ArrayList<>(); public boolean post(Runnable r){ r.run(); return true; } public void evaluateJavascript(String s,Object cb){ scripts.add(s); } }
