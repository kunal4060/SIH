import React, { useState } from 'react';
import { Globe, MapPin, Menu, ShieldCheck, LocateFixed, Search, X, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const POPULAR_HUBS = [
  "Pune, Maharashtra",
  "Nashik, Maharashtra",
  "Nagpur, Maharashtra",
  "Ludhiana, Punjab",
  "Karnal, Haryana",
  "Indore, Madhya Pradesh",
  "Jaipur, Rajasthan",
  "Bengaluru, Karnataka",
  "Hyderabad, Telangana",
  "Surat, Gujarat"
];

const Navbar = ({ onToggleDrawer }) => {
  const { user, language, changeLanguage, updateLocation, detectRealLocation, detectingLocation, t } = useAuth();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [searchCity, setSearchCity] = useState('');

  const currentLocation = user?.location || localStorage.getItem('smart_farm_real_location') || t('locating');

  const handleSelectLocation = async (loc) => {
    await updateLocation(loc);
    setIsLocationModalOpen(false);
    setSearchCity('');
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (searchCity.trim()) {
      handleSelectLocation(searchCity.trim());
    }
  };

  return (
    <>
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-150 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between sticky top-0 z-20 w-full transition-all">
        {/* Left: Mobile Drawer Trigger & Real Location Pill */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onToggleDrawer}
            className="lg:hidden p-2 -ml-1 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0 cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Interactive Real Location Pill */}
          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-900 text-xs font-semibold border border-emerald-200/70 transition-all hover:shadow-sm shrink-0 max-w-[170px] sm:max-w-xs group cursor-pointer"
            title="Click to change or detect real location"
          >
            {detectingLocation ? (
              <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin shrink-0" />
            ) : (
              <MapPin className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform shrink-0" />
            )}
            <span className="truncate font-medium">
              {detectingLocation ? t('locating') : currentLocation}
            </span>
            <span className="text-[10px] text-emerald-700 font-bold ml-0.5 opacity-60 group-hover:opacity-100 underline">
              {t('change_location')}
            </span>
          </button>

          {/* Hardware Status */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/80 text-slate-600 text-[11px] font-medium shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{t('telemetry_active')}</span>
          </div>
        </div>

        {/* Right: Language Selector & RASmalAI Badge */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-slate-50 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-medium border border-slate-200 hover:border-slate-300 transition-colors">
            <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-transparent border-none outline-none cursor-pointer text-slate-700 font-semibold text-xs"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="mr">मराठी</option>
              <option value="te">తెలుగు</option>
            </select>
          </div>

          {/* RASmalAI Production Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>RASmalAI Core</span>
          </div>
        </div>
      </header>

      {/* Sleek Minimalist Location Picker Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-5 sm:p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  <span>Set Your Farm Location</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Used for real-time weather forecasting and hyper-local crop advisories
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* GPS Auto-Detect Button */}
            <button
              type="button"
              disabled={detectingLocation}
              onClick={async () => {
                await detectRealLocation(true);
                setIsLocationModalOpen(false);
              }}
              className="w-full py-3 px-4 rounded-2xl border-2 border-emerald-500/80 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow"
            >
              {detectingLocation ? (
                <>
                  <Loader2 className="w-4 h-4 text-emerald-700 animate-spin" />
                  <span>Detecting GPS Location...</span>
                </>
              ) : (
                <>
                  <LocateFixed className="w-4 h-4 text-emerald-600" />
                  <span>Use My Current Real GPS Location</span>
                </>
              )}
            </button>

            {/* Manual City Search Input */}
            <form onSubmit={handleCustomSubmit} className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Or Enter City / District / State
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  placeholder="e.g. Pune, Indore, Ludhiana, Jaipur..."
                  className="w-full pl-9 pr-20 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!searchCity.trim()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-slate-900 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Set
                </button>
              </div>
            </form>

            {/* Quick Regional Agricultural Hubs */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Popular Agricultural Regions
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {POPULAR_HUBS.map((hub) => {
                  const isCurrent = currentLocation.toLowerCase().includes(hub.split(',')[0].toLowerCase());
                  return (
                    <button
                      key={hub}
                      type="button"
                      onClick={() => handleSelectLocation(hub)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border text-left font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {isCurrent && <Check className="w-3 h-3 text-white" />}
                      <span>{hub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
