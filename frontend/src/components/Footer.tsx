import { Link, useLocation } from 'react-router-dom';
import { Mail, Globe, Rss } from 'lucide-react';

export function Footer() {
  const location = useLocation();
  
  const allowedPaths = ['/', '/terms', '/privacy'];
  
  // Renderizar o footer apenas na Home, Termos e Privacidade
  if (!allowedPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <footer className="bg-slate-900 text-slate-400 pt-56 md:pt-48 pb-12 mt-32 relative">
      
      {/* Floating Newsletter Card */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-5xl z-20">
        <div className="bg-gradient-to-r from-slate-900 to-[#004b87] rounded-3xl p-8 md:p-12 shadow-2xl border border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative group">
          {/* Background FX */}
          <div className="absolute inset-0 bg-[#003865] opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0"></div>
          <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>

          <div className="relative z-10 md:w-2/3">
            <h3 className="text-white text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">Assine a Newsletter Premium</h3>
            <p className="text-blue-100/80 text-lg max-w-xl">
              Receba análises profundas, curadoria exclusiva de inteligência artificial e fique à frente do mercado de tecnologia.
            </p>
          </div>
          
          <div className="relative z-10 md:w-1/3 flex justify-start md:justify-end w-full">
            <button className="bg-white text-[#004b87] font-bold py-4 px-8 rounded-full hover:bg-blue-50 transition-colors w-full md:w-auto shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200 cursor-not-allowed opacity-90">
              Em Breve
            </button>
          </div>
        </div>
      </div>

      <div className="container grid grid-cols-2 md:grid-cols-12 gap-x-8 gap-y-12 mb-16 relative z-10 mt-16 md:mt-12">
        {/* Coluna Esquerda: Logo e Contato (Ocupa mais espaço) */}
        <div className="col-span-2 md:col-span-5 flex flex-col">
          <Link to="/" className="flex items-center gap-2 mb-6">
            <img src="/logo-newsletter-branca.png" alt="Newsletter Logo" className="h-6 object-contain opacity-90" />
          </Link>
          <div className="text-[13px] text-slate-400 leading-relaxed mb-8 max-w-xs">
            <p>A sua dose diária de inteligência.</p>
            <p>Curadoria automatizada por IA trazendo o que realmente importa no mundo da tecnologia.</p>
          </div>
          
          <div className="flex gap-12 text-[13px]">
            <div>
              <span className="text-slate-500 block mb-1">Contato</span>
              <a href="mailto:email@example.com" className="text-white hover:text-blue-400 transition-colors">email@example.com</a>
            </div>
          </div>
        </div>
        
        {/* Colunas da Direita: Links (Grid menor) */}
        <div className="col-span-1 md:col-span-2">
          <h4 className="text-slate-500 mb-6 text-[13px]">Categorias</h4>
          <ul className="space-y-4 text-[13px]">
            <li><Link to="/?category=inteligencia-artificial" className="text-white hover:text-blue-400 transition-colors">Inteligência Artificial</Link></li>
            <li><Link to="/?category=cloud-computing" className="text-white hover:text-blue-400 transition-colors">Cloud Computing</Link></li>
            <li><Link to="/?category=ciberseguranca" className="text-white hover:text-blue-400 transition-colors">Cibersegurança</Link></li>
            <li><Link to="/?category=programacao" className="text-white hover:text-blue-400 transition-colors">Programação</Link></li>
          </ul>
        </div>

        <div className="col-span-1 md:col-span-2 pt-[42px] md:pt-[44px]">
          <ul className="space-y-4 text-[13px]">
            <li><Link to="/?category=hardware" className="text-white hover:text-blue-400 transition-colors">Hardware</Link></li>
            <li><Link to="/?category=startups" className="text-white hover:text-blue-400 transition-colors">Startups</Link></li>
            <li><Link to="/?category=blockchain" className="text-white hover:text-blue-400 transition-colors">Blockchain</Link></li>
            <li><Link to="/?category=ciencia-espaco" className="text-white hover:text-blue-400 transition-colors">Ciência e Espaço</Link></li>
          </ul>
        </div>
        
        <div className="col-span-2 md:col-span-3">
          <h4 className="text-slate-500 mb-6 text-[13px]">Plataforma</h4>
          <ul className="space-y-4 text-[13px]">
            <li><Link to="/" className="text-white hover:text-blue-400 transition-colors">Início</Link></li>
            <li><Link to="/preferences" className="text-white hover:text-blue-400 transition-colors">Feed Personalizado</Link></li>
            <li><Link to="/terms" className="text-white hover:text-blue-400 transition-colors">Termos de Serviço</Link></li>
            <li><Link to="/privacy" className="text-white hover:text-blue-400 transition-colors">Política de Privacidade</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="container border-t border-slate-800/50 pt-8 pb-4 text-center">
        <p className="text-[12px] text-slate-500">© {new Date().getFullYear()} Newsletter Inteligente. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
