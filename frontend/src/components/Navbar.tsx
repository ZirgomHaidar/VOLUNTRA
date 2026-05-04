import { Link, useLocation } from 'react-router-dom';
import { Search, User, LogOut, Heart, ShieldCheck, Trophy, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Heart className="text-indigo-600 fill-indigo-600" />
              <span className="text-xl font-bold text-gray-900">Voluntra</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/') ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <div className="flex items-center">
                  <Search size={16} className="mr-2" />
                  Discovery
                </div>
              </Link>
              <Link 
                to="/portfolio" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/portfolio') ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <div className="flex items-center">
                  <User size={16} className="mr-2" />
                  Portfolio
                </div>
              </Link>
              <Link 
                to="/verification" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/verification') ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <div className="flex items-center">
                  <ShieldCheck size={16} className="mr-2" />
                  Trust
                </div>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden lg:flex items-center space-x-4 border-r border-gray-100 pr-6">
              <div className="flex items-center text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm font-bold shadow-sm border border-amber-100">
                <Trophy size={14} className="mr-1.5" />
                {user?.points} pts
              </div>
              <div className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm font-bold shadow-sm border border-blue-100">
                <Shield size={14} className="mr-1.5" />
                {user?.reliability_score}%
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <button 
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
