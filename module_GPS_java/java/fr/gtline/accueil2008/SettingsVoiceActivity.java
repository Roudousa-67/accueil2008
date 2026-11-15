package fr.gtline.accueil2008;
import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.speech.RecognizerIntent;
import java.util.ArrayList;
import org.json.JSONObject;
/** Reçoit la dictée de recherche sans modifier MainActivity ni la localisation. */
public final class SettingsVoiceActivity extends Activity {
 @Override public void onCreate(Bundle state){super.onCreate(state);if(state!=null)return;
  try{Intent intent=new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
   intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL,RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
   intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE,"fr-FR");intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS,1);
   intent.putExtra(RecognizerIntent.EXTRA_PROMPT,"Quel réglage cherches-tu ?");
   startActivityForResult(intent,720);
  }catch(Exception unavailable){finishWith("","unavailable");}
 }
 @Override protected void onActivityResult(int request,int result,Intent data){super.onActivityResult(request,result,data);if(request!=720)return;
  ArrayList<String> words=data==null?null:data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
  if(result==RESULT_OK&&words!=null&&!words.isEmpty())finishWith(words.get(0),"");else finishWith("","cancelled");
 }
 private void finishWith(String text,String error){
  try{JSONObject value=new JSONObject();value.put("id",System.currentTimeMillis());value.put("text",text.length()>160?text.substring(0,160):text);value.put("error",error);
   getSharedPreferences("settings_voice",0).edit().putString("result",value.toString()).apply();
  }catch(Exception ignored){}finish();
 }
}
