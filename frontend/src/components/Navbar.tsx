import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, LogOut, Heart, ShieldCheck, Trophy, Shield, LayoutDashboard, Bell, X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    if (user?.role === 'volunteer') {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications/');
      setNotifications(response.data);
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}`, { is_read: true });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Failed to mark as read");
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Heart className="text-indigo-600 fill-indigo-600" />
              <span className="text-xl font-bold text-gray-900">Voluntra</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-4">
              {/* Volunteer Links */}
              {user?.role === 'volunteer' && (
                <>
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
                </>
              )}

              {/* Organization Links */}
              {user?.role === 'organization' && (
                <Link 
                  to="/org-dashboard" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/org-dashboard') ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <div className="flex items-center">
                    <LayoutDashboard size={16} className="mr-2" />
                    Dashboard
                  </div>
                </Link>
              )}

              {/* Admin Links */}
              {user?.role === 'admin' && (
                <Link 
                  to="/admin-panel" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin-panel') ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <div className="flex items-center">
                    <ShieldCheck size={16} className="mr-2" />
                    Admin Panel
                  </div>
                </Link>
              )}

              {user?.role === 'volunteer' && (
                <Link 
                  to="/verification" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/verification') ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <div className="flex items-center">
                    <Shield size={16} className="mr-2" />
                    Trust
                  </div>
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user?.role === 'volunteer' && (
              <div className="hidden lg:flex items-center space-x-4 border-r border-gray-100 pr-4">
                <div className="flex items-center text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm font-bold shadow-sm border border-amber-100">
                  <Trophy size={14} className="mr-1.5" />
                  {user?.points} pts
                </div>
                <div className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm font-bold shadow-sm border border-blue-100">
                  <Shield size={14} className="mr-1.5" />
                  {user?.reliability_score}%
                </div>
              </div>
            )}

            {/* Notifications Bell */}
            {user?.role === 'volunteer' && (
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer relative"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                      <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                        <X size={16} />
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div 
                            key={n.id} 
                            className={`px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!n.is_read ? 'bg-indigo-50/30' : ''}`}
                          >
                            <div className="flex justify-between items-start">
                              <p className={`text-sm font-bold ${!n.is_read ? 'text-indigo-900' : 'text-gray-900'}`}>{n.title}</p>
                              {!n.is_read && (
                                <button 
                                  onClick={() => markAsRead(n.id)}
                                  className="text-indigo-600 hover:text-indigo-800 cursor-pointer"
                                  title="Mark as read"
                                >
                                  <Check size={14} />
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">{n.message}</p>
                            <p className="text-[10px] text-gray-400 mt-2">{new Date(n.created_at).toLocaleString()}</p>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center text-gray-500 text-sm">
                          No notifications yet.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <button 
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
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
