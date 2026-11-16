package fr.gtline.accueil2008;

import android.app.Activity;
import android.app.DownloadManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.webkit.JavascriptInterface;
import org.json.JSONObject;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.security.MessageDigest;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/** Téléchargements propres à l'application. Ne lit ni GPS, ni contacts, ni stockage d'autres applis. */
public final class AppFiles721 {
 private final Activity a;
 private final DownloadManager dm;
 private final SharedPreferences prefs;
 private final File folder,thumbs;
 private final ExecutorService worker=Executors.newSingleThreadExecutor();
 private volatile long id;
 private volatile String phase="idle",message="";
 private volatile boolean verifying;
 private volatile long verifiedId=-1;

 public AppFiles721(Activity activity){
  a=activity;dm=(DownloadManager)a.getSystemService(Context.DOWNLOAD_SERVICE);
  prefs=a.getSharedPreferences("updates721",0);id=prefs.getLong("id",-1);
  File external=a.getExternalFilesDir(null);folder=external==null?null:new File(external,"updates721");
  thumbs=new File(a.getCacheDir(),"thumbnails721");
 }
 private static JSONObject json(){return new JSONObject();}
 private static void put(JSONObject o,String k,Object v){try{o.put(k,v);}catch(Exception ignored){}}
 private String error(String msg){JSONObject o=json();put(o,"error",msg);return o.toString();}
 private boolean inside(File f,File root){return FilePolicy721.inside(f,root);}
 @JavascriptInterface public synchronized String download(String url,String sha,String version){
  if(id>0&&(phase.equals("downloading")||phase.equals("verifying")))return error("Un téléchargement est déjà en cours.");
  if(folder==null)return error("Stockage de téléchargement indisponible.");
  if(!FilePolicy721.validRelease(url,sha,version))return error("Lien de mise à jour ou empreinte SHA-256 invalide.");
  if(id>0&&dm!=null)dm.remove(id);
  if(!folder.isDirectory()&&!folder.mkdirs())return error("Impossible de créer le dossier de téléchargement.");
  final File target=new File(folder,"Accueil2008GT_v"+version+".apk");if(target.exists()&&!target.delete())return error("Ancien fichier impossible à remplacer.");
  try{
   DownloadManager.Request r=new DownloadManager.Request(Uri.parse(url));
   r.setTitle("Accueil 2008 GT "+version);r.setDescription("Mise à jour demandée depuis les paramètres");
   r.setDestinationUri(Uri.fromFile(target));r.setMimeType("application/vnd.android.package-archive");
   r.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
   id=dm.enqueue(r);verifiedId=-1;phase="downloading";message="";
   prefs.edit().putLong("id",id).putString("sha",sha.toLowerCase(java.util.Locale.US)).putString("version",version).putString("file",target.getName()).apply();
   return status();
  }catch(Exception e){phase="error";message="Téléchargement indisponible sur ce poste.";return error(message);}
 }
 @JavascriptInterface public synchronized String status(){
  JSONObject out=json();long read=0,total=0;
  if(id>0&&dm!=null){Cursor c=null;try{
   c=dm.query(new DownloadManager.Query().setFilterById(id));
   if(c!=null&&c.moveToFirst()){
    int s=c.getInt(c.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS));
    read=c.getLong(c.getColumnIndexOrThrow(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR));total=c.getLong(c.getColumnIndexOrThrow(DownloadManager.COLUMN_TOTAL_SIZE_BYTES));
    if(s==DownloadManager.STATUS_SUCCESSFUL){if(verifiedId==id)phase="ready";else if(!verifying&&!phase.equals("error"))verify(id);}
    else if(s==DownloadManager.STATUS_FAILED){phase="error";message="Échec du téléchargement. Réessaie avec une connexion disponible.";}
    else {phase="downloading";message=s==DownloadManager.STATUS_PAUSED?"En attente du réseau…":"";}
   }else if(!phase.equals("cancelled")){phase="idle";id=-1;}
  }catch(Exception e){phase="error";message="Impossible de lire le téléchargement.";}finally{if(c!=null)c.close();}}
  put(out,"phase",phase);put(out,"message",message);put(out,"bytes",Math.max(0,read));put(out,"total",Math.max(0,total));put(out,"percent",total>0?Math.min(100,Math.max(0,read*100/total)):-1);return out.toString();
 }
 private synchronized void verify(final long job){
  verifying=true;phase="verifying";final String expected=prefs.getString("sha",""),version=prefs.getString("version","");
  final File file=folder==null?null:new File(folder,prefs.getString("file",""));
  worker.submit(new Runnable(){public void run(){String failure="";try{
   if(file==null||!inside(file,folder)||!file.isFile()||file.length()<1024||file.length()>250L*1024*1024)throw new Exception("Fichier APK incomplet ou trop volumineux.");
   MessageDigest digest=MessageDigest.getInstance("SHA-256");InputStream in=new FileInputStream(file);try{byte[] b=new byte[65536];int n;while((n=in.read(b))!=-1){if(id!=job)throw new Exception("Téléchargement annulé.");digest.update(b,0,n);}}finally{in.close();}
   StringBuilder hex=new StringBuilder();for(byte b:digest.digest())hex.append(String.format(java.util.Locale.US,"%02x",b&255));
   if(!hex.toString().equals(expected))throw new Exception("Empreinte SHA-256 incorrecte : installation bloquée.");
   PackageManager pm=a.getPackageManager();PackageInfo apk=pm.getPackageArchiveInfo(file.getAbsolutePath(),PackageManager.GET_SIGNATURES),installed=pm.getPackageInfo(a.getPackageName(),PackageManager.GET_SIGNATURES);
   if(apk==null||!a.getPackageName().equals(apk.packageName)||!version.equals(apk.versionName)||apk.versionCode<=installed.versionCode)throw new Exception("Paquet ou version incompatible avec cette application.");
   if(apk.signatures==null||installed.signatures==null||apk.signatures.length!=installed.signatures.length||apk.signatures.length==0)throw new Exception("Signature APK absente.");
   for(int i=0;i<apk.signatures.length;i++)if(!apk.signatures[i].equals(installed.signatures[i]))throw new Exception("Signature différente : installation bloquée.");
  }catch(Exception e){failure=e.getMessage()==null?"Vérification impossible.":e.getMessage();}
  synchronized(AppFiles721.this){verifying=false;if(id!=job)return;if(failure.length()==0){verifiedId=job;phase="ready";message="Empreinte, paquet, version et signature vérifiés.";}else{phase="error";message=failure;}}
  }});
 }
 @JavascriptInterface public synchronized String cancel(){long job=id;id=-1;verifiedId=-1;phase="cancelled";message="Téléchargement annulé.";prefs.edit().remove("id").apply();if(job>0&&dm!=null)dm.remove(job);return status();}
 @JavascriptInterface public synchronized String install(){
  if(!phase.equals("ready")||verifiedId!=id)return error("Attends la fin de la vérification.");
  final Uri uri=dm.getUriForDownloadedFile(id);if(uri==null)return error("Fichier téléchargé introuvable.");
  a.runOnUiThread(new Runnable(){public void run(){try{
   if(Build.VERSION.SDK_INT>=26&&!a.getPackageManager().canRequestPackageInstalls()){
    a.startActivity(new Intent("android.settings.MANAGE_UNKNOWN_APP_SOURCES",Uri.parse("package:"+a.getPackageName())));return;
   }
   Intent i=new Intent(Intent.ACTION_VIEW);i.setDataAndType(uri,"application/vnd.android.package-archive");i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);a.startActivity(i);
  }catch(Exception ignored){message="Ouvre le fichier depuis les téléchargements Android pour installer.";}}});return status();
 }
 private long size(File file,File root){return FilePolicy721.bytes(file,root);}
 private File protectedFile(){String name=prefs.getString("file","");return id>0&&folder!=null&&name.length()>0?new File(folder,name):null;}
 private long oldDownloads(boolean remove){return FilePolicy721.downloads(folder,protectedFile(),remove);}
 @JavascriptInterface public synchronized String storage(){JSONObject o=json();long thumb=size(thumbs,a.getCacheDir()),cache=0;File[] files=a.getCacheDir().listFiles();if(files!=null)for(File f:files)if(!f.equals(thumbs))cache+=size(f,a.getCacheDir());put(o,"thumbnails",thumb);put(o,"cache",cache);put(o,"downloads",oldDownloads(false));put(o,"protectedDownload",id>0);return o.toString();}
 private long erase(File f,File root){return FilePolicy721.erase(f,root);}
 @JavascriptInterface public synchronized String clean(String category){long freed=0;if(category.equals("downloads"))freed=oldDownloads(true);else if(category.equals("thumbnails"))freed=erase(thumbs,a.getCacheDir());else if(category.equals("cache")){File[] list=a.getCacheDir().listFiles();if(list!=null)for(File f:list)if(!f.equals(thumbs))freed+=erase(f,a.getCacheDir());}else return error("Catégorie inconnue.");JSONObject o=json();put(o,"freed",freed);return o.toString();}
 public void release(){worker.shutdown();}
}
