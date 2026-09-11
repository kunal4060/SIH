import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Globe, Sliders, Cpu, Save, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, language, changeLanguage, t } = useAuth();

  const [threshold, setThreshold] = useState(40);
  const [minWater, setMinWater] = useState(15);
  const [crop, setCrop] = useState(user?.crop || 'Tomato');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-5 sm:space-y-6 content-padding w-full">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700 shrink-0" />
          <span>{t('settings_title')}</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">{t('settings_subtitle')}</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 sm:space-y-6">
        {/* Profile Settings */}
        <div className="farm-card p-4 sm:p-6 bg-white border border-slate-200 space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            <span>{t('farmer_crop_profile')}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">{t('farmer_full_name')}</label>
              <input
                type="text"
                disabled
                value={user?.full_name || 'Administrator'}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-700 cursor-not-allowed min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">{t('primary_farm_crop')}</label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-emerald-500 min-h-[44px]"
              >
                <option value="Tomato">{t('crop_tomato')} (Solanum lycopersicum)</option>
                <option value="Potato">{t('crop_potato')} (Solanum tuberosum)</option>
                <option value="Corn">{t('crop_corn')} (Zea mays)</option>
                <option value="Grape">{t('crop_grape')} (Vitis vinifera)</option>
                <option value="Pepper">{t('crop_pepper')} (Capsicum annuum)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Language Preferences */}
        <div className="farm-card p-4 sm:p-6 bg-white border border-slate-200 space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-sky-600" />
            <span>{t('multilingual_interface')}</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">{t('display_language')}</label>
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="w-full sm:w-64 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-emerald-500 min-h-[44px]"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="mr">मराठी (Marathi)</option>
              <option value="te">తెలుగు (Telugu)</option>
            </select>
          </div>
        </div>

        {/* Irrigation Thresholds */}
        <div className="farm-card p-4 sm:p-6 bg-white border border-slate-200 space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-600" />
            <span>{t('auto_irrigation_thresholds')}</span>
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>{t('auto_moisture_trigger')}</span>
                <span className="text-emerald-700">{threshold}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="60"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-full accent-emerald-600 cursor-pointer h-2"
              />
              <p className="text-[11px] text-slate-500 mt-1">{t('auto_moisture_sub')}</p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>{t('min_water_interlock')}</span>
                <span className="text-rose-700">{minWater}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={minWater}
                onChange={(e) => setMinWater(e.target.value)}
                className="w-full accent-rose-600 cursor-pointer h-2"
              />
              <p className="text-[11px] text-slate-500 mt-1">{t('min_water_sub')}</p>
            </div>
          </div>
        </div>

        {/* AI & System Diagnostics */}
        <div className="farm-card p-4 sm:p-6 bg-white border border-slate-200 space-y-3 text-xs">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2 mb-2">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <span>{t('system_diagnostics')}</span>
          </h3>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 font-mono text-slate-700 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
              <span>{t('diag_local_ml')}</span>
              <strong className="text-emerald-600">{t('diag_local_ml_status')}</strong>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
              <span>{t('diag_ai_engine')}</span>
              <strong className="text-teal-600">{t('diag_ai_status')}</strong>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
              <span>{t('diag_esp32')}</span>
              <strong className="text-sky-600">{t('diag_esp32_status')}</strong>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="submit"
            className="btn-primary py-3 px-6 text-xs font-bold rounded-xl shadow-lg w-full sm:w-auto justify-center min-h-[44px]"
          >
            <Save className="w-4 h-4" />
            <span>{t('btn_save_config')}</span>
          </button>

          {saved && (
            <span className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1 py-1">
              <ShieldCheck className="w-4 h-4" /> {t('settings_saved_success')}
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

export default Settings;
