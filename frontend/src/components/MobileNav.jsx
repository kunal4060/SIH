import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Stethoscope, 
  Bot, 
  History, 
  Menu 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MobileNav = ({ onToggleDrawer }) => {
  const { t } = useAuth();
  const items = [
    { path: '/dashboard', label: t('mobile_home') || 'Home', icon: LayoutDashboard },
    { path: '/chatbot', label: t('mobile_chat') || 'AI Chat', icon: Bot },
    { path: '/plant-doctor', label: t('mobile_scan') || 'Scan Leaf', icon: Stethoscope, highlight: true },
    { path: '/history', label: t('nav_history') || 'History', icon: History },
  ];

  return (
    <nav className="mobile-bottom-nav fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 z-40 shadow-2xl flex justify-around items-center md:hidden safe-area-bottom">
      {items.map((item) => {
        const Icon = item.icon;
        if (item.highlight) {
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center relative -top-3 w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-600/30 border-4 border-white transition-all ${
                  isActive ? 'scale-110 shadow-emerald-500/50 ring-2 ring-emerald-500/40' : 'active:scale-95'
                }`
              }
              aria-label="Plant Doctor Scan"
            >
              <Icon className="w-6 h-6 stroke-[2.2]" />
            </NavLink>
          );
        }

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[11px] font-medium transition-colors min-w-[54px] min-h-[44px] ${
                isActive ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}

      {/* Menu / Drawer Toggle */}
      <button
        type="button"
        onClick={onToggleDrawer}
        className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[11px] font-medium text-slate-500 hover:text-slate-800 transition-colors min-w-[54px] min-h-[44px]"
        aria-label="Open full navigation menu"
      >
        <Menu className="w-5 h-5 mb-0.5" />
        <span>{t('mobile_menu') || 'Menu'}</span>
      </button>
    </nav>
  );
};

export default MobileNav;
