import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Stethoscope, 
  Bot, 
  History, 
  Activity, 
  Droplet, 
  CloudSun, 
  Settings as SettingsIcon, 
  LogOut,
  Sprout,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const { logout, user, t } = useAuth();

  const navItems = [
    { path: '/dashboard', label: t('nav_dashboard'), icon: LayoutDashboard },
    { path: '/plant-doctor', label: t('nav_plant_doctor'), icon: Stethoscope, badge: 'AI Dual' },
    { path: '/chatbot', label: t('nav_chatbot'), icon: Bot },
    { path: '/history', label: t('nav_history'), icon: History },
    { path: '/monitoring', label: t('nav_monitoring'), icon: Activity },
    { path: '/irrigation', label: t('nav_irrigation'), icon: Droplet },
    { path: '/weather', label: t('nav_weather'), icon: CloudSun },
    { path: '/settings', label: t('nav_settings'), icon: SettingsIcon },
  ];

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  const renderNavContent = (isMobile = false) => (
    <>
      {/* Brand Header: RASmalAI */}
      <div className="p-5 sm:p-6 flex items-center justify-between border-b border-emerald-900/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-emerald-950 shadow-lg shrink-0">
            <Sprout className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl leading-tight text-white tracking-wide">
              RASmalAI
            </h1>
            <p className="text-[10px] text-emerald-400 font-semibold tracking-tight uppercase">
              Rural Agriculture System (ML & AI)
            </p>
          </div>
        </div>
        {isMobile && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-300 hover:text-white hover:bg-emerald-900/60 transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 min-h-[44px] ${
                  isActive
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-inner'
                    : 'text-emerald-200/80 hover:bg-emerald-900/40 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 opacity-90 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-500 text-emerald-950">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Farmer Profile Footer */}
      <div className="p-4 border-t border-emerald-900/60 bg-emerald-950/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-emerald-800 flex items-center justify-center text-emerald-200 font-bold text-sm shrink-0">
              {user?.full_name?.charAt(0) || 'F'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-emerald-100 truncate">{user?.full_name || 'Farmer'}</p>
              <p className="text-[10px] text-emerald-400 truncate">{user?.crop || 'Tomato Crop'}</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (onClose) onClose();
              logout();
            }}
            title="Logout"
            className="p-2.5 rounded-lg text-emerald-300 hover:text-rose-400 hover:bg-emerald-900/50 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar (Visible on 1024px+) */}
      <aside className="hidden lg:flex w-64 bg-emerald-950 text-white min-h-screen flex-col border-r border-emerald-900 shadow-xl shrink-0">
        {renderNavContent(false)}
      </aside>

      {/* Mobile/Tablet Off-Canvas Drawer (Visible when isOpen is true on <1024px) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" 
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Slide-out Panel */}
          <aside className="relative w-72 max-w-[85vw] bg-emerald-950 text-white flex flex-col border-r border-emerald-900 shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {renderNavContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
