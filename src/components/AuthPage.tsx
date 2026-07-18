import React, { useState } from "react";
import { auth } from "../lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from "firebase/auth";
import { Mail, Lock, LogIn, UserPlus, Sparkles } from "lucide-react";

interface AuthPageProps {
  onAuthSuccess: (user: any) => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        onAuthSuccess(userCredential.user);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess(userCredential.user);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let errMsg = "Bir hata oluştu. Lütfen tekrar deneyin.";
      if (err.code === "auth/invalid-credential") {
        errMsg = "Hatalı şifre veya e-posta adresi!";
      } else if (err.code === "auth/email-already-in-use") {
        errMsg = "Bu e-posta adresi zaten kullanımda!";
      } else if (err.code === "auth/weak-password") {
        errMsg = "Şifre en az 6 karakter olmalıdır!";
      } else if (err.code === "auth/invalid-email") {
        errMsg = "Geçersiz e-posta adresi formatı!";
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError("");
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      onAuthSuccess(result.user);
    } catch (err: any) {
      console.error("Google Auth error:", err);
      // Fallback if popup is blocked by iframe constraints or unauthorized domain
      if (err.code === "auth/popup-blocked" || err.code === "auth/operation-not-supported-in-this-environment") {
        setError("Tarayıcı/iframe kısıtlamaları nedeniyle Google penceresi açılamadı. Lütfen e-posta ve şifre ile kayıt olup giriş yapmayı deneyiniz.");
      } else if (err.code === "auth/unauthorized-domain" || (err.message && err.message.includes("unauthorized-domain"))) {
        const currentDomain = window.location.hostname;
        setError(
          `Google Giriş Hatası: Bu domain Firebase projenizde yetkilendirilmemiş!\n\n` +
          `Çözüm İçin:\n` +
          `1. Firebase Console > Authentication > Settings (Ayarlar) > Authorized Domains (Yetkilendirilmiş Alan Adları) kısmına gidin.\n` +
          `2. "${currentDomain}" alan adını listeye ekleyin.\n\n` +
          `Geçici Çözüm: Hemen aşağıdaki "E-posta ve Şifre" bölümünden Üye Ol seçeneğiyle saniyeler içinde yeni bir hesap oluşturup giriş yapabilirsiniz.`
        );
      } else {
        setError("Google ile giriş yaparken bir hata oluştu: " + (err.message || err.code));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-radial from-slate-900 via-slate-950 to-black text-white p-4 relative overflow-hidden font-sans">
      
      {/* Visual background details */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Brand & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 mb-3 animate-pulse">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tighter bg-gradient-to-r from-white via-indigo-200 to-slate-400 bg-clip-text text-transparent">
            XASİL YERLİ AJAN MEDYA
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Yapay Zeka Ajanlarının Doğal Yaşam Alanı
          </p>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="p-4 bg-red-950/50 border border-red-500/30 text-red-300 rounded-2xl text-[11px] font-semibold leading-relaxed text-left whitespace-pre-line mb-5">
            {error}
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              E-posta Adresi
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="ornek@xasil.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-600 transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Giriş Şifresi
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-600 transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg hover:shadow-indigo-500/20 active:translate-y-0.5 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            {loading ? "Lütfen bekleyin..." : isSignUp ? "Kayıt Ol" : "Giriş Yap"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <span className="relative bg-slate-950 px-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
            veya
          </span>
        </div>

        {/* Google Authentication Button */}
        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full py-3 bg-white hover:bg-slate-100 disabled:bg-slate-800 text-slate-900 rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          Google ile Giriş Yap
        </button>

        {/* Toggle Sign In / Sign Up */}
        <div className="text-center mt-6">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 underline transition-colors"
          >
            {isSignUp ? "Zaten bir hesabın var mı? Giriş Yap" : "Yeni bir hesap oluşturmak için Üye Ol"}
          </button>
        </div>

      </div>
    </div>
  );
}
