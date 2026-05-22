"use client";
import { useState } from "react";
import { Bird, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

const USERS = [
  { email: "msduran1994@gmail.com",          password: "savicol2026",  role: "admin",    name: "Michael Durán" },
  { email: "oficialcumplimiento@savicol.com.co", password: "savicol2026", role: "admin", name: "Iván Bonilla" },
  { email: "anacontrolinterno@savicol.com.co",   password: "savicol2026", role: "auditor", name: "Kerling Hernández" },
  { email: "anacontrolinterno1@savicol.com.co",  password: "savicol2026", role: "auditor", name: "Alexander Téllez" },
  { email: "auxcontrolinterno1@savicol.com.co",  password: "savicol2026", role: "auditor", name: "Hilary Basto" },
  { email: "auxcontrolinterno2@savicol.com.co",  password: "savicol2026", role: "auditor", name: "Jaider González" },
  { email: "auxcontrolinterno3@savicol.com.co",  password: "savicol2026", role: "auditor", name: "Michael Durán Aux" },
  { email: "gerencia@savicol.com",               password: "savicol2026", role: "gerencia", name: "Gerencia General" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      const user = USERS.find((u) => u.email === email && u.password === password);
      if (user) {
        localStorage.setItem("avia_user", JSON.stringify(user));
        router.push("/dashboard");
      } else {
        setError("Credenciales incorrectas. Verifica tu email y contraseña.");
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-700/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-xl">
            <Bird className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">AviaGuard 2026</h1>
          <p className="text-blue-300 text-sm mt-1">Plataforma de Auditoría · Savicol</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-6">Iniciar Sesión</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                <input
                  type="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@savicol.com.co"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                <input
                  type={showPwd ? "text" : "password"} required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                />
                <button type="button" onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-white">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors text-sm shadow-lg"
            >
              {loading ? "Verificando…" : "Ingresar al Sistema"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-xs text-blue-400 text-center mb-3">Credenciales de demo:</p>
            <div className="space-y-1.5">
              {[
                { email: "msduran1994@gmail.com", role: "Admin", color: "text-red-400" },
                { email: "anacontrolinterno1@savicol.com.co", role: "Auditor", color: "text-blue-400" },
                { email: "gerencia@savicol.com", role: "Gerencia", color: "text-purple-400" },
              ].map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => { setEmail(u.email); setPassword("savicol2026"); }}
                  className="w-full flex items-center justify-between px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-xs"
                >
                  <span className="text-blue-300 truncate">{u.email}</span>
                  <span className={`font-semibold flex-shrink-0 ml-2 ${u.color}`}>{u.role}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-blue-500 text-center mt-3">Contraseña: savicol2026</p>
          </div>
        </div>

        <p className="text-center text-blue-600/50 text-xs mt-6">
          © 2026 Savicol · Control Interno · AviaGuard
        </p>
      </div>
    </div>
  );
}
