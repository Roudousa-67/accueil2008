import fr.gtline.accueil2008.FilePolicy721;
import java.io.File;
import java.nio.file.Files;
public class FilePolicy721Test {
 static int checks=0;
 static void check(boolean b,String s){if(!b)throw new AssertionError(s);checks++;System.out.println("OK "+s);}
 public static void main(String[] args)throws Exception{
  String url="https://github.com/Roudousa-67/accueil2008/releases/download/v7.22/Accueil2008GT_v7.22.apk",sha=new String(new char[64]).replace('\0','a');
  check(FilePolicy721.validRelease(url,sha,"7.22"),"release officielle et empreinte valides");
  check(!FilePolicy721.validRelease(url,null,"7.22"),"empreinte absente refusée");
  check(!FilePolicy721.validRelease(url,"x"+sha.substring(1),"7.22"),"empreinte non hexadécimale refusée");
  check(!FilePolicy721.validRelease(url.replace("https:","http:"),sha,"7.22"),"HTTP refusé");
  check(!FilePolicy721.validRelease(url.replace("github.com","github.com.evil.test"),sha,"7.22"),"domaine trompeur refusé");
  check(!FilePolicy721.validRelease(url.replace("Roudousa-67","autre"),sha,"7.22"),"autre dépôt refusé");
  check(!FilePolicy721.validRelease(url+"?x=1",sha,"7.22"),"lien altéré refusé");
  check(!FilePolicy721.validRelease(url,sha,"../7.22"),"traversée par version refusée");
  File temp=Files.createTempDirectory("policy721-").toFile(),cache=new File(temp,"cache"),data=new File(temp,"settings"),updates=new File(temp,"updates");cache.mkdir();updates.mkdir();Files.write(data.toPath(),new byte[17]);
  File small=new File(cache,"small");Files.write(small.toPath(),new byte[23]);File nested=new File(cache,"nested");nested.mkdir();File sub=new File(nested,"part");Files.write(sub.toPath(),new byte[11]);
  check(FilePolicy721.bytes(small,cache)==23,"taille fichier cache réelle");check(FilePolicy721.bytes(nested,cache)==11,"taille récursive réelle");
  check(FilePolicy721.erase(data,cache)==0&&data.length()==17,"réglages hors cache protégés");
  File escape=new File(cache,"../settings");check(FilePolicy721.erase(escape,cache)==0&&data.exists(),"traversée hors cache bloquée");
  File link=new File(cache,"link");Files.createSymbolicLink(link.toPath(),nested.toPath());check(FilePolicy721.bytes(link,cache)==0,"lien symbolique ignoré");check(FilePolicy721.erase(link,cache)==0&&sub.exists(),"cible du lien jamais supprimée");
  File cycle=new File(nested,"cycle");Files.createSymbolicLink(cycle.toPath(),cache.toPath());check(FilePolicy721.bytes(nested,cache)==11,"boucle de liens sans récursion infinie");
  File current=new File(updates,"Accueil2008GT_v7.22.apk"),old=new File(updates,"Accueil2008GT_v7.21.apk"),other=new File(updates,"note.txt");Files.write(current.toPath(),new byte[50]);Files.write(old.toPath(),new byte[30]);Files.write(other.toPath(),new byte[9]);
  check(FilePolicy721.downloads(updates,current,false)==30,"aperçu exclut téléchargement actuel");check(old.exists(),"aperçu sans suppression");
  check(FilePolicy721.downloads(updates,current,true)==30&&!old.exists(),"seul ancien APK effacé");check(current.length()==50,"APK actuel protégé");check(other.length()==9,"fichier inconnu conservé");
  check(FilePolicy721.erase(small,cache)==23&&!small.exists(),"cache choisi supprimé");check(data.length()==17,"réglages toujours intacts après nettoyage");
  Files.delete(cycle.toPath());Files.delete(link.toPath());FilePolicy721.erase(nested,cache);Files.delete(current.toPath());Files.delete(other.toPath());Files.delete(data.toPath());updates.delete();cache.delete();temp.delete();
  System.out.println(checks+" vérifications natives réussies.");
 }
}
