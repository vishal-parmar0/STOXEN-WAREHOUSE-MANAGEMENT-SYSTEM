import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NAV_ITEMS } from '../../utils/constants';
import API from '../../api/api';
import {
  LayoutDashboard, Package, ArrowLeftRight, Truck, ClipboardList,
  BarChart3, Bell, Users, Settings, ChevronsLeft, ChevronsRight,
  ChevronDown, ChevronRight, LogOut, X,
} from 'lucide-react';

const iconMap = {
  LayoutDashboard, Package, ArrowLeftRight, Truck, ClipboardList,
  BarChart3, Bell, Users, Settings,
};

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen, isMobile }) {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const [expandedItem, setExpandedItem] = useState(null);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    API.get('/alerts/unread-count').then(res => {
      setAlertCount(res.data?.count || 0);
    }).catch(() => {});
    const interval = setInterval(() => {
      API.get('/alerts/unread-count').then(res => {
        setAlertCount(res.data?.count || 0);
      }).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // On mobile, sidebar is always expanded (not collapsed)
  const isCollapsed = isMobile ? false : collapsed;

  const renderNavItem = (item) => {
    const Icon = iconMap[item.icon];
    const isActive = location.pathname === item.path ||
      (item.children && item.children.some(c => location.pathname === c.path));
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItem === item.label;

    // Role-based visibility
    if (item.roles && !item.roles.some(r => hasRole(r))) return null;

    const handleNavClick = () => {
      if (isMobile) setMobileOpen(false);
    };

    return (
      <div key={item.label}>
        {hasChildren ? (
          <button
            onClick={() => setExpandedItem(isExpanded ? null : item.label)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              isActive
                ? 'bg-teal-50 text-teal-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? item.label : undefined}
          >
            {Icon && <Icon size={20} className="shrink-0" />}
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && alertCount > 0 && (
                  <span className="bg-teal-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {alertCount}
                  </span>
                )}
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </>
            )}
          </button>
        ) : (
          <NavLink
            to={item.path}
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-teal-50 text-teal-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? item.label : undefined}
          >
            {Icon && <Icon size={20} className="shrink-0" />}
            {!isCollapsed && (
              <>
                <span className="flex-1">{item.label}</span>
                {item.badge && alertCount > 0 && (
                  <span className="bg-teal-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {alertCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        )}

        {/* Sub-items */}
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="ml-8 mt-1 space-y-0.5">
            {item.children.map((child) => (
              <NavLink
                key={child.label}
                to={child.path}
                onClick={handleNavClick}
                className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                  location.pathname === child.path
                    ? 'text-teal-700 font-medium bg-teal-50/50'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderGroup = (items, label) => {
    const visibleItems = items.filter(item => !item.roles || item.roles.some(r => hasRole(r)));
    if (visibleItems.length === 0) return null;

    return (
      <div>
        {!isCollapsed && label && (
          <p className="px-3 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            {label}
          </p>
        )}
        {isCollapsed && label && <div className="border-t border-gray-100 my-2" />}
        <div className="space-y-0.5">
          {items.map(renderNavItem)}
        </div>
      </div>
    );
  };

  // Determine if sidebar should show — on mobile use mobileOpen, on desktop always visible
  const showSidebar = isMobile ? mobileOpen : true;
  const sidebarWidth = isMobile ? 'w-64' : (collapsed ? 'w-16' : 'w-60');

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 flex flex-col z-40 transition-all duration-200 ease-in-out ${sidebarWidth} ${
        isMobile && !mobileOpen ? '-translate-x-full' : 'translate-x-0'
      }`}
    >
      {/* Logo */}
      <div className={`h-16 flex items-center border-b border-gray-100 shrink-0 ${(collapsed && !isMobile) ? 'justify-center px-2' : 'px-5 justify-between'}`}>
        {(collapsed && !isMobile) ? (
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
        ) : (
          <>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              St<span className="text-teal-600">ox</span>en
            </span>
            {isMobile && (
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            )}
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {renderGroup(NAV_ITEMS.main, 'Main')}
        {renderGroup(NAV_ITEMS.management, 'Management')}
        {renderGroup(NAV_ITEMS.admin, 'Admin')}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-gray-100 p-3 space-y-2 shrink-0">
        {/* User card */}
        {!isCollapsed && user && (
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-teal-700">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
            <button
              onClick={logout}
              className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}

        {isCollapsed && user && (
          <button
            onClick={logout}
            className="w-full flex justify-center py-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        )}

        {/* Collapse toggle — hide on mobile */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            {collapsed ? <ChevronsRight size={18} /> : <><ChevronsLeft size={18} /> <span>Collapse</span></>}
          </button>
        )}
      </div>
    </aside>
  );
}
