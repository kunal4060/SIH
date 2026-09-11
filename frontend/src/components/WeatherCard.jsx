import React from 'react';
import { Sun, CloudRain, Wind, Droplets } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const WeatherCard = ({ weather }) => {
  const { t } = useAuth();
  if (!weather) return null;

  return (
    <div className="farm-card p-5 sm:p-6 bg-gradient-to-br from-slate-900 to-emerald-950 text-white border border-emerald-900/60 shadow-lg w-full">
      <div className="flex items-center justify-between border-b border-emerald-800/40 pb-3.5 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-emerald-300 uppercase tracking-wider">{t('current_weather')}</h3>
          <p className="text-xs text-slate-400">{weather.location}</p>
        </div>
        <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
          <Sun className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 items-center mb-5">
        <div>
          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">{weather.temperature}°C</div>
          <p className="text-xs sm:text-sm font-medium text-emerald-200 mt-1">{t(weather.condition) || weather.condition}</p>
        </div>
        <div className="space-y-1.5 text-xs text-slate-300 border-t sm:border-t-0 sm:border-l border-emerald-800/40 pt-3 sm:pt-0 sm:pl-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-slate-400"><CloudRain className="w-3.5 h-3.5 text-sky-400" /> {t('weather_rain')}</span>
            <span className="font-semibold text-white">{weather.rainProbability}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-slate-400"><Wind className="w-3.5 h-3.5 text-teal-400" /> {t('weather_wind')}</span>
            <span className="font-semibold text-white">{weather.windSpeed}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-slate-400"><Droplets className="w-3.5 h-3.5 text-blue-400" /> {t('weather_humidity')}</span>
            <span className="font-semibold text-white">{weather.humidity}%</span>
          </div>
        </div>
      </div>

      {/* Forecast */}
      {weather.forecast && (
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-3 border-t border-emerald-800/40 text-center">
          {weather.forecast.map((f, i) => (
            <div key={i} className="bg-emerald-900/40 p-2 rounded-xl border border-emerald-800/30">
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-300 truncate">{t(f.day) || f.day}</p>
              <p className="text-xs sm:text-sm font-bold text-white my-0.5">{f.temp}</p>
              <p className="text-[9px] sm:text-[10px] text-emerald-400 truncate">{t(f.condition) || f.condition}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeatherCard;
