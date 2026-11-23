package fr.gtline.accueil2008;
import java.io.*;import java.net.*;import java.nio.file.*;import java.util.*;
public class TransferTest {
 static int checks=0;
 static void ok(boolean c,String n){if(!c){System.out.println("ÉCHEC "+n);System.exit(1);}System.out.println("OK "+n);checks++;}
 static Object[] call(String method,String url,byte[] body)throws Exception{HttpURLConnection h=(HttpURLConnection)new URL(url).openConnection(Proxy.NO_PROXY);h.setRequestMethod(method);if(body!=null){h.setDoOutput(true);h.setFixedLengthStreamingMode(body.length);h.getOutputStream().write(body);}int code=h.getResponseCode();InputStream in=code<400?h.getInputStream():h.getErrorStream();String text=in==null?"":new String(in.readAllBytes(),"UTF-8");return new Object[]{code,text};}
 public static void main(String[] a)throws Exception{
  File base=Files.createTempDirectory("t738").toFile();
  android.webkit.WebView web=new android.webkit.WebView();
  LocalTransfer738 t=new LocalTransfer738(new android.app.Activity(),web,base,300_000);
  String st=t.start();ok(st.contains("\"running\":true"),"serveur démarré");
  String tok=t.newToken("ticket",15,"");String u="http://127.0.0.1:8738";
  ok((int)call("GET",u+"/?t=faux",null)[0]==403,"jeton faux refusé");
  Object[] pg=call("GET",u+"/?t="+tok,null);ok((int)pg[0]==200&&((String)pg[1]).contains("Envoi vers l'autoradio"),"page d'envoi servie");
  byte[] jpg=new byte[120_000];jpg[0]=(byte)0xFF;jpg[1]=(byte)0xD8;jpg[2]=(byte)0xFF;
  Object[] up=call("POST",u+"/envoi?t="+tok+"&type=ticket&nom=ticket.jpg",jpg);ok((int)up[0]==200&&((String)up[1]).contains("\"ok\":true"),"ticket reçu");
  ok(android.webkit.WebView.scripts.size()==1&&android.webkit.WebView.scripts.get(0).contains("Transfer738.onReceived")&&android.webkit.WebView.scripts.get(0).contains("\"kind\":\"ticket\""),"appli prévenue de la réception");
  String name=((String)up[1]).replaceAll(".*\"name\":\"([^\"]+)\".*","$1");ok(t.dataUrl(name).startsWith("data:image/jpeg;base64,/9j/"),"photo relue en data URL");
  ok((int)call("POST",u+"/envoi?t="+tok+"&type=ticket",("pas une image").getBytes())[0]==415,"faux ticket refusé");
  ok((int)call("POST",u+"/envoi?t="+tok+"&type=gpx&nom=Vosges.gpx",("<?xml version=\"1.0\"?><gpx version=\"1.1\"><trk></trk></gpx>").getBytes())[0]==200,"GPX reçu");
  t.keep(name,true);
  // Quota de 300 000 octets : le ticket gardé reste, les fichiers non gardés les plus anciens partent d'abord.
  byte[] png=new byte[100_000];png[0]=(byte)0x89;png[1]='P';png[2]='N';png[3]='G';
  Thread.sleep(1100);
  Object[] a1=call("POST",u+"/envoi?t="+tok+"&type=fichier&nom=A.png",png);ok((int)a1[0]==200,"fichier A reçu");
  Thread.sleep(1100);
  Object[] b1=call("POST",u+"/envoi?t="+tok+"&type=fichier&nom=B.png",png);ok((int)b1[0]==200,"fichier B reçu en libérant de la place");
  String list=t.list();ok(list.contains(name)&&list.contains("-B.png")&&!list.contains("-A.png")&&!list.contains(".gpx"),"les plus anciens fichiers non gardés supprimés, le ticket gardé reste");
  byte[] big=new byte[200_000];big[0]=(byte)0xFF;big[1]=(byte)0xD8;big[2]=(byte)0xFF;
  ok((int)call("POST",u+"/envoi?t="+tok+"&type=ticket",big)[0]==507,"stockage plein signalé quand seuls des fichiers gardés restent");
  String saved=t.saveText("rapport-2026-11-23-0824.html","<html>rapport</html>");ok(saved.contains("\"ok\":true"),"rapport enregistré");
  String dtok=t.newToken("telechargement",15,"rapport-2026-11-23-0824.html");
  ok((int)call("GET",u+"/?t="+tok,null)[0]==403,"ancien jeton invalidé par le nouveau QR");
  Object[] dl=call("GET",u+"/fichier?t="+dtok+"&nom=rapport-2026-11-23-0824.html",null);ok((int)dl[0]==200&&((String)dl[1]).contains("rapport"),"rapport téléchargeable");
  ok((int)call("GET",u+"/fichier?t="+dtok+"&nom=../../etc/passwd",null)[0]==404,"chemin hors du dossier refusé");
  Object[] etat=call("GET",u+"/etat?t="+dtok,null);ok(((String)etat[1]).contains("\"kind\":\"telechargement\""),"état du lien lisible par la page");
  t.newToken("ticket",1,"");java.lang.reflect.Field f=LocalTransfer738.class.getDeclaredField("tokenUntil");f.setAccessible(true);f.setLong(t,System.currentTimeMillis()-1);
  ok((int)call("GET",u+"/?t="+dtok,null)[0]==403,"lien expiré refusé");
  ok(LocalTransfer738.detect("<gpx>".getBytes())!=null&&LocalTransfer738.detect(new byte[]{'%','P','D','F','1'}).equals("pdf"),"signatures GPX et PDF reconnues");
  // 7.41 : téléchargement depuis la boîte aux lettres Internet (ici un petit serveur local).
  com.sun.net.httpserver.HttpServer relay=com.sun.net.httpserver.HttpServer.create(new InetSocketAddress("127.0.0.1",0),0);
  byte[] photo=new byte[50_000];photo[0]=(byte)0xFF;photo[1]=(byte)0xD8;photo[2]=(byte)0xFF;
  relay.createContext("/file/",x->{byte[] b=x.getRequestURI().getPath().endsWith(".txt")?"pas une image".getBytes():photo;x.sendResponseHeaders(200,b.length);x.getResponseBody().write(b);x.close();});
  relay.start();LocalTransfer738.RELAY="http://127.0.0.1:"+relay.getAddress().getPort()+"/";
  ok(t.download("http://exemple.invalid/file/a.jpg","ticket","ticket.jpg").contains("\"ok\":false"),"téléchargement refusé hors de la boîte aux lettres");
  int before=android.webkit.WebView.scripts.size();
  ok(t.download(LocalTransfer738.RELAY+"file/abc.jpg","ticket","ticket.jpg").contains("\"ok\":true"),"téléchargement lancé");
  for(int i=0;i<50&&android.webkit.WebView.scripts.size()==before;i++)Thread.sleep(100);
  String sc=android.webkit.WebView.scripts.get(android.webkit.WebView.scripts.size()-1);
  ok(sc.contains("\"kind\":\"ticket\"")&&sc.contains("\"via\":\"internet\"")&&sc.contains("\"type\":\"jpg\""),"photo venue d'Internet rangée et signalée à l'appli");
  before=android.webkit.WebView.scripts.size();t.download(LocalTransfer738.RELAY+"file/x.txt","ticket","x.txt");
  for(int i=0;i<50&&android.webkit.WebView.scripts.size()==before;i++)Thread.sleep(100);
  ok(android.webkit.WebView.scripts.get(android.webkit.WebView.scripts.size()-1).contains("\"error\""),"fichier non conforme refusé");
  relay.stop(0);
  ok(LocalTransfer738.mobile("rmnet_data0")&&LocalTransfer738.mobile("ccmni1")&&!LocalTransfer738.mobile("wlan0")&&!LocalTransfer738.mobile("ap0"),"adresse 4G jamais proposée dans le QR");
  t.stop();ok(t.status().contains("\"running\":false"),"serveur arrêté");
  System.out.println(checks+" contrôles du serveur de transfert réussis.");System.exit(0);
 }
}
