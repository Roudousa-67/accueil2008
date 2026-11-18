import com.android.apksig.ApkSigner;
import com.android.apksig.ApkVerifier;
import java.io.*;
import java.security.*;
import java.security.cert.X509Certificate;
import java.util.*;

/** Adaptateur local minimal ; utilise exclusivement une clé existante fournie par le propriétaire. */
public final class Signer728 {
    static String hex(byte[] data) { StringBuilder s=new StringBuilder();for(byte b:data)s.append(String.format("%02x",b));return s.toString(); }
    static String password(String value) {
        if(!value.startsWith("env:"))throw new IllegalArgumentException("Les mots de passe doivent passer par l’environnement.");
        String result=System.getenv(value.substring(4));if(result==null)throw new IllegalArgumentException("Variable de signature manquante.");return result;
    }
    public static void main(String[] a) {
        try {
            if(a.length<2)throw new IllegalArgumentException();
            if(a[0].equals("verify")) {
                ApkVerifier.Result r=new ApkVerifier.Builder(new File(a[a.length-1])).build().verify();
                if(!r.isVerified())throw new GeneralSecurityException();
                for(X509Certificate c:r.getSignerCertificates())System.out.println("Signer certificate SHA-256 digest: "+hex(MessageDigest.getInstance("SHA-256").digest(c.getEncoded())));
                return;
            }
            if(!a[0].equals("sign"))throw new IllegalArgumentException();
            Map<String,String> options=new HashMap<>();for(int i=1;i<a.length-1;i+=2)options.put(a[i],a[i+1]);
            String pass=password(options.get("--ks-pass")),keyPass=options.containsKey("--key-pass")?password(options.get("--key-pass")):pass;
            KeyStore ks=KeyStore.getInstance("PKCS12");try(InputStream in=new FileInputStream(options.get("--ks"))){ks.load(in,pass.toCharArray());}
            String alias=options.get("--ks-key-alias");if(alias==null){for(Enumeration<String> e=ks.aliases();e.hasMoreElements();){String next=e.nextElement();if(ks.isKeyEntry(next)){alias=next;break;}}}
            if(alias==null)throw new GeneralSecurityException();PrivateKey key=(PrivateKey)ks.getKey(alias,keyPass.toCharArray());
            List<X509Certificate> chain=new ArrayList<>();for(java.security.cert.Certificate c:ks.getCertificateChain(alias))chain.add((X509Certificate)c);
            ApkSigner.SignerConfig config=new ApkSigner.SignerConfig.Builder("accueil2008",key,chain).build();
            new ApkSigner.Builder(Collections.singletonList(config)).setInputApk(new File(a[a.length-1])).setOutputApk(new File(options.get("--out"))).setMinSdkVersion(24).setV1SigningEnabled(true).setV2SigningEnabled(true).setV3SigningEnabled(true).build().sign();
        } catch(Exception failure) {
            System.err.println("Vérification ou signature impossible : contrôler la clé d’origine et sa configuration privée.");System.exit(1);
        }
    }
}
