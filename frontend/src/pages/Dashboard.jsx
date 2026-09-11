import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sprout, 
  Droplet, 
  Thermometer, 
  Wind, 
  Camera, 
  Bot, 
  CloudSun, 
  ArrowUpRight, 
  Activity,
  ShieldCheck
} from 'lucide-react';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SensorCard from '../components/SensorCard';
import WeatherCard from '../components/WeatherCard';
import MotorControl from '../components/MotorControl';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await dashboardAPI.getSummary();
      setData(res.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span>Loading Smart Farm Dashboard...</span>
      </div>
    );
  }

  const sensors = data?.sensors || {};
  const weather = data?.weather || {};
  const motor = data?.motor || {};
  const user = data?.user || {};
  const latestScan = data?.latestScan;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-5 md:space-y-6 max-w-7xl mx-auto content-padding w-full">
      {/* Welcome Banner */}
      <div className="farm-card p-5 sm:p-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white border border-emerald-800 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 text-emerald-300 text-xs font-semibold">
              <Sprout className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t('smart_farming_platform')}</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {t('welcome_farmer')}, {user.name || t('farmer')} 🌱
            </h1>
            <p className="text-xs text-emerald-200 mt-1">
              {t('field_location')}: <strong>{user.location}</strong> | {t('primary_crop')}: <strong>{t(user.crop) || user.crop}</strong>
            </p>
          </div>

          <button
            onClick={() => navigate('/plant-doctor')}
            className="btn-primary w-full sm:w-auto py-3 sm:py-3.5 px-5 sm:px-6 text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/30 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold shrink-0"
          >
            <Camera className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span>{t('btn_scan_now_hero')}</span>
          </button>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <button
          onClick={() => navigate('/plant-doctor')}
          className="farm-card p-3 sm:p-4 flex items-center justify-between bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-md group min-h-[64px]"
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-white/20 shrink-0">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="text-left min-w-0">
              <h4 className="font-extrabold text-xs sm:text-sm text-white truncate">{t('quick_scan_title')}</h4>
              <p className="text-[10px] text-emerald-100 truncate">{t('dual_ai_doctor')}</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
        </button>

        <button
          onClick={() => navigate('/chatbot')}
          className="farm-card p-3 sm:p-4 flex items-center justify-between bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-md group min-h-[64px]"
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-teal-500/20 text-teal-400 shrink-0">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="text-left min-w-0">
              <h4 className="font-extrabold text-xs sm:text-sm text-white truncate">{t('quick_ask_title')}</h4>
              <p className="text-[10px] text-slate-400 truncate">{t('chat_bot_name')}</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
        </button>

        <button
          onClick={() => navigate('/irrigation')}
          className="farm-card p-3 sm:p-4 flex items-center justify-between bg-white border border-slate-200 hover:border-sky-300 transition-all shadow-sm group min-h-[64px]"
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-sky-50 text-sky-600 shrink-0">
              <Droplet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="text-left min-w-0">
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{t('quick_irrigation_title')}</h4>
              <p className="text-[10px] text-slate-500 truncate">{t('motor_control_title')}</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
        </button>

        <button
          onClick={() => navigate('/weather')}
          className="farm-card p-3 sm:p-4 flex items-center justify-between bg-white border border-slate-200 hover:border-teal-300 transition-all shadow-sm group min-h-[64px]"
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-amber-50 text-amber-600 shrink-0">
              <CloudSun className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="text-left min-w-0">
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{t('quick_weather_title')}</h4>
              <p className="text-[10px] text-slate-500 truncate">{t('forecast_info')}</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
        </button>
      </div>

      {/* Main Sensor Gauges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <SensorCard
          title="Soil Moisture"
          value={`${sensors.soilMoisture || 42}%`}
          unit="Moisture"
          status={sensors.moistureStatus || 'Good'}
          icon={Droplet}
          color="emerald"
        />
        <SensorCard
          title="Water Tank Level"
          value={`${sensors.waterLevel || 68}%`}
          unit="Capacity"
          status={sensors.waterStatus || 'Sufficient'}
          icon={Activity}
          color="sky"
        />
        <SensorCard
          title="Field Temperature"
          value={`${sensors.temperature || 29}°C`}
          unit="Celsius"
          status="Normal Range"
          icon={Thermometer}
          color="amber"
        />
        <SensorCard
          title="Air Humidity"
          value={`${sensors.humidity || 71}%`}
          unit="RH"
          status="Optimal"
          icon={Wind}
          color="indigo"
        />
      </div>

      {/* Weather & Motor Control Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeatherCard weather={weather} />
        <MotorControl
          initialStatus={motor.status}
          initialMode={motor.mode}
          onStateChange={fetchDashboardData}
        />
      </div>

      {/* Latest Plant Scan Banner */}
      {latestScan && (
        <div className="farm-card p-4 sm:p-6 border border-emerald-200 bg-emerald-50/40">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              {latestScan.imagePath && (
                <img
                  src={`http://localhost:8000${latestScan.imagePath}`}
                  alt="Recent Scan"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-emerald-300 shadow-sm shrink-0"
                />
              )}
              <div className="min-w-0 truncate">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-full inline-block">
                  {t('recent_scan')} ({latestScan.date})
                </span>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 mt-1 truncate">{latestScan.diagnosis}</h3>
                <p className="text-xs text-slate-600 truncate">{t('crop')}: {latestScan.plant} | Confidence: {latestScan.confidence}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/history')}
              className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-emerald-300 text-emerald-900 bg-white font-bold text-xs hover:bg-emerald-100 transition-colors shrink-0 text-center min-h-[44px]"
            >
              {t('view_history_report')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
