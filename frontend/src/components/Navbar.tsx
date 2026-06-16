import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { LogOut, User as UserIcon } from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const location = useLocation();
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }


  return (
    <nav className="bg-[#004b87] text-white shadow-sm sticky top-0 z-50">
      <div className="container relative flex h-16 items-center justify-between gap-4">
        
        {/* Espaçador flex esquerdo para balancear a direita e manter o centro exato */}
        <div className="flex-1 hidden md:block"></div>

        {/* LOGO (Centro Absoluto) */}
          <Link to="/" className="flex items-center gap-2 group absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
            <img src="/logo-newsletter-branca.png" alt="Newsletter Logo" className="h-8 md:h-10 object-contain hover:opacity-90 transition-opacity" />
          </Link>

        {/* ÁREA DO USUÁRIO (Direita) */}
        <div className="flex-1 flex items-center justify-end gap-2 shrink-0">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-blue-200 hidden xl:inline-block mr-2 font-medium">
                Olá, {user?.name?.split(' ')[0]}
              </span>
              <Link to="/preferences" title="Preferências">
                <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                  <UserIcon className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={handleLogout} title="Sair">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">Entrar</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-white text-[#004b87] hover:bg-blue-50 font-bold">Assinar</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
