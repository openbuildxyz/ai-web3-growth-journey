// React import removed (automatic JSX transform)
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import LogoutButton from './LogoutButton';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  showLogout?: boolean;
}

export default function Header({ title = 'Evalis', showBackButton = true, showLogout = false }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          {showBackButton && !isHomePage && (
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-black"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Home
            </Button>
          )}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-black rounded-lg">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-black tracking-tight">
              {title}
            </h1>
          </div>
        </div>
        
        {/* Right side - Logout button */}
        {showLogout && (
          <div className="flex items-center">
            <LogoutButton 
              variant="outline" 
              size="sm"
              className="text-gray-600 hover:text-black border-gray-300"
            />
          </div>
        )}
      </div>
    </header>
  );
} 