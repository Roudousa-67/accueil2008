package fr.gtline.accueil2008;
import java.io.File;
import java.io.IOException;
/** Politique indépendante d'Android, testée avec de vrais fichiers locaux. */
public final class FilePolicy721 {
 private FilePolicy721(){}
 public static boolean validRelease(String url,String sha,String version){
  return version!=null&&version.matches("[0-9]+(?:\\.[0-9]+){1,2}")&&sha!=null&&sha.matches("(?i)[0-9a-f]{64}")&&("https://github.com/Roudousa-67/accueil2008/releases/download/v"+version+"/Accueil2008GT_v"+version+".apk").equals(url);
 }
 public static boolean inside(File f,File root){try{
  if(f==null||root==null)return false;
  String base=root.getAbsolutePath()+File.separator,path=f.getAbsolutePath();
  if(!path.startsWith(base))return false;
  // Refuser les liens symboliques et les traversées, même si leur cible reste dans le cache.
  return f.getCanonicalPath().equals(root.getCanonicalPath()+File.separator+path.substring(base.length()));
 }catch(IOException e){return false;}}
 public static long bytes(File f,File root){return visit(f,root,null,false,false,0);}
 public static long erase(File f,File root){return visit(f,root,null,true,false,0);}
 public static long downloads(File root,File keep,boolean remove){
  long total=0;File[] list=root==null?null:root.listFiles();if(list==null)return 0;
  for(File f:list){if(!inside(f,root)||!f.isFile()||f.equals(keep)||!f.getName().matches("Accueil2008GT_v[0-9.]+\\.apk"))continue;long n=f.length();if(!remove||f.delete())total+=n;}return total;
 }
 private static long visit(File f,File root,File keep,boolean remove,boolean unused,int depth){
  if(depth>32||!inside(f,root)||!f.exists()||f.equals(keep))return 0;
  if(f.isFile()){long n=f.length();return !remove||f.delete()?n:0;}
  long n=0;File[] files=f.listFiles();if(files!=null)for(File child:files)n+=visit(child,root,keep,remove,false,depth+1);if(remove)f.delete();return n;
 }
}
