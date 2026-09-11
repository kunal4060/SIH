import React, { useState, useEffect } from 'react';
import { Activity, Droplet, Thermometer, Wind, RefreshCw, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sensorsAPI } from '../services/api';
import SensorCard from '../components/SensorCard';

const Monitoring = () => {
  const { t } = useAuth();
  const [sensors, setSensors] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchSensors = async () => {
    try {
      const res = await sensorsAPI.getCurrent();
      setSensors(res.data);
    } catch (err) {
      console.error("Sensor telemetry error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensors();
    const interval = setInterval(fetchSensors, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-5 sm:space-y-6 content-padding w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0" />
            <span>{t('monitoring_title')}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{t('monitoring_subtitle')}</p>
        </div>

        <button
          onClick={fetchSensors}
          className="p-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-1.5 min-h-[40px] shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{t('btn_refresh')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
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
          title="Ambient Temperature"
          value={`${sensors.temperature || 29}°C`}
          unit="Celsius"
          status="Normal Range"
          icon={Thermometer}
          color="amber"
        />
        <SensorCard
          title="Relative Humidity"
          value={`${sensors.humidity || 71}%`}
          unit="RH"
          status="Optimal"
          icon={Wind}
          color="indigo"
        />
      </div>

      <div className="farm-card p-4 sm:p-6 bg-white border border-slate-200 w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">{t('esp32_connector_title')}</h3>
            <p className="text-xs text-slate-500 break-all">{t('esp32_endpoint')} <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-700">POST /api/sensors/telemetry</code></p>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 font-mono text-slate-700 overflow-x-auto">
          <p>{t('esp32_signal')}</p>
          <p>{t('esp32_protocol')}</p>
          <p>{t('esp32_status')}</p>
        </div>
      </div>
    </div>
  );
};

export default Monitoring;
