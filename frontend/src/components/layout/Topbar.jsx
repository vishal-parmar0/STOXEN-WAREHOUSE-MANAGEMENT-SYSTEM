import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Bell, Settings, ChevronDown, LogOut, User, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ pageTitle, pageSubtitle, onMenuToggle, isMobile }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="h-16 flex items-center justify-between px-3 sm:px-4 lg:px-6 shrink-0">
      {/* Left - Menu toggle + Title */}
      <div className="flex items-center gap-3 min-w-0">
        {isMobile && (
          <button
            onClick={onMenuToggle}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
          >
            <Menu size={20} className="text-gray-600" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{pageTitle || 'Dashboard'}</h1>
          <p className="text-xs sm:text-sm text-gray-500 truncate">
            {pageSubtitle || `${getGreeting()}, ${user?.name?.split(' ')[0] || 'User'} 👋`}
          </p>
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden sm:flex items-center bg-gray-100 rounded-full px-4 h-9 w-60">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-400 ml-2 outline-none"
          />
        </div>

        {/* Bell */}
        <button
          onClick={() => navigate('/alerts')}
          className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <Bell size={18} className="text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full" />
        </button>

        {/* Settings */}
        <button
          onClick={() => navigate('/settings')}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <Settings size={18} className="text-gray-600" />
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-200" />

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
              <span className="text-xs font-bold text-teal-700">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900 leading-tight">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate max-w-[120px]">{user?.email}</p>
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden md:block" />
          </button>

          {/* Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-50 animate-fadeIn">
              <button
                onClick={() => { setShowUserMenu(false); navigate('/settings'); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <User size={16} /> Profile
              </button>
              <button
                onClick={() => { setShowUserMenu(false); navigate('/settings'); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Settings size={16} /> Settings
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={() => { setShowUserMenu(false); logout(); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
