package fr.gtline.accueil2008;
import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.speech.RecognizerIntent;
import java.util.ArrayList;
import org.json.JSONObject;
/** Reçoit la dictée de recherche sans modifier MainActivity ni la localisation. */
public final class SettingsVoiceActivity extends Activity {
 @Override public void onCreate(Bundle state){super.onCreate(state);
  // 7.47 : page invisible qui cache Waze. Ouverte en plein écran, elle fait passer la fenêtre libre de
  // Waze en dessous ; puis elle remet l'accueil devant et se ferme (même enchaînement que sur la vidéo).
  if(getIntent()!=null&&getIntent().getBooleanExtra("hideNav746",false)){hideNav();return;}
  if(state!=null)return;
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
 private void hideNav(){
  overridePendingTransition(0,0);
  // 7.48 : page opaque (noire). Transparente, Android la traitait comme une vitre : Waze restait visible
  // et rien n'était réordonné. Sur la vidéo du 25/11, c'est une appli opaque qui cachait Waze.
  try{getWindow().setBackgroundDrawable(new android.graphics.drawable.ColorDrawable(0xFF000000));
   android.view.View v=new android.view.View(this);v.setBackgroundColor(0xFF000000);setContentView(v);}catch(Throwable ignored){}
  try{GpsDock.HiddenApi.exemptAll();java.lang.reflect.Method m=android.app.Activity.class.getDeclaredMethod("convertFromTranslucent");m.setAccessible(true);m.invoke(this);}catch(Throwable ignored){}
  final android.os.Handler h=new android.os.Handler();
  h.postDelayed(new Runnable(){@Override public void run(){
   try{android.app.ActivityManager am=(android.app.ActivityManager)getSystemService(ACTIVITY_SERVICE);
    for(android.app.ActivityManager.AppTask t:am.getAppTasks()){android.app.ActivityManager.RecentTaskInfo i=t.getTaskInfo();
     android.content.ComponentName b=i==null?null:i.baseActivity;
     if(b!=null&&b.getClassName().endsWith(".MainActivity")){t.moveToFront();break;}}
   }catch(Throwable ignored){}
   h.postDelayed(new Runnable(){@Override public void run(){try{finishAndRemoveTask();}catch(Throwable e){finish();}overridePendingTransition(0,0);}},250);
  }},180);
 }
 private void finishWith(String text,String error){
  try{JSONObject value=new JSONObject();value.put("id",System.currentTimeMillis());value.put("text",text.length()>160?text.substring(0,160):text);value.put("error",error);
   getSharedPreferences("settings_voice",0).edit().putString("result",value.toString()).apply();
  }catch(Exception ignored){}finish();
 }
}
