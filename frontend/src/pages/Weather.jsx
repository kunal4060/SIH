import React, { useState, useEffect } from 'react';
import { CloudSun } from 'lucide-react';
import WeatherCard from '../components/WeatherCard';
import { weatherAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Weather = () => {
  const { user, t } = useAuth();
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const loc = user?.location || localStorage.getItem('smart_farm_real_location') || '';
    weatherAPI.getCurrent(loc)
      .then(res => setWeather(res.data))
      .catch(err => console.error(err));
  }, [user]);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-5 sm:space-y-6 content-padding w-full">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <CloudSun className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 shrink-0" />
          <span>{t('weather_page_title')}</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">{t('weather_page_subtitle')}</p>
      </div>

      <WeatherCard weather={weather} />
    </div>
  );
};

export default Weather;
