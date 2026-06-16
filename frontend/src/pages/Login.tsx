import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../services/api';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      login(data.access_token, data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#f4f6f8]">
      {/* Left Panel - Branding (Azul Estadão) */}
      <div className="hidden lg:flex w-1/2 bg-[#004b87] p-16 flex-col justify-center items-start text-white relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center mb-12">
            <img src="/logo-newsletter-branca.png" alt="Newsletter Digital" className="h-10 object-contain" />
          </div>
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">Olá,<br/>Bem-vindo de volta!</h1>
          <p className="text-blue-100 text-lg leading-relaxed">
            Acesse sua conta para conferir a curadoria diária de tecnologia. 
            Nós lemos milhares de artigos para que você não precise.
          </p>
        </div>
      </div>

      {/* Right Panel - Form (Clean/Off-white) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-[440px] bg-white p-8 sm:p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Entrar</h2>
            <p className="text-slate-500">Acesse sua conta para continuar.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 text-center font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail"
                className="w-full h-12 bg-transparent border border-slate-200 rounded-full px-5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#004b87] focus:ring-1 focus:ring-[#004b87] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha"
                  className="w-full h-12 bg-transparent border border-slate-200 rounded-full pl-5 pr-12 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#004b87] focus:ring-1 focus:ring-[#004b87] transition-all"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="flex justify-end pt-2 pr-2">
                <a href="#" className="text-sm text-[#004b87] hover:underline font-medium">
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-6 bg-[#004b87] hover:bg-[#003865] text-white font-medium rounded-full transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-900/20"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Login'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            Ainda não tem conta?{' '}
            <Link to="/register" className="text-[#004b87] hover:underline font-semibold">
              Criar conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
