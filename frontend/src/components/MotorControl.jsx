import React, { useState } from 'react';
import { Power, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motorAPI } from '../services/api';

const MotorControl = ({ initialStatus = 'OFF', initialMode = 'MANUAL', onStateChange }) => {
  const { t } = useAuth();
  const [status, setStatus] = useState(initialStatus);
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleControl = async (newAction, newMode) => {
    setLoading(true);
    setError(null);
    try {
      const res = await motorAPI.control(newAction, newMode);
      setStatus(res.data.status);
      setMode(res.data.mode);
      if (onStateChange) onStateChange(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update motor state.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="farm-card p-5 sm:p-6 border border-slate-200 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5 mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${status === 'ON' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-100 text-slate-500'}`}>
            <Power className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-slate-800 truncate">{t('motor_pump_title')}</h3>
            <p className="text-xs text-slate-500 truncate">{t('motor_relay_sub')}</p>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
            status === 'ON' ? 'bg-emerald-100 text-emerald-800 animate-pulse' : 'bg-slate-100 text-slate-600'
          }`}>
            ● {status === 'ON' ? t('motor_running') : t('motor_off')}
          </span>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="mb-4 sm:mb-5">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('irrigation_mode')}</label>
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => handleControl(status, 'MANUAL')}
            disabled={loading}
            className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all min-h-[42px] flex items-center justify-center ${
              mode === 'MANUAL'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('mode_manual')}
          </button>
          <button
            type="button"
            onClick={() => handleControl(status, 'AUTO')}
            disabled={loading}
            className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all min-h-[42px] ${
              mode === 'AUTO'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" /> {t('mode_auto')}
          </button>
        </div>
      </div>

      {/* Manual Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        <button
          type="button"
          onClick={() => handleControl('ON', mode)}
          disabled={loading || status === 'ON'}
          className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all min-h-[44px] ${
            status === 'ON'
              ? 'bg-emerald-100 text-emerald-800 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-emerald-600/30'
          }`}
        >
          <Power className="w-4 h-4" /> {t('btn_turn_motor_on')}
        </button>

        <button
          type="button"
          onClick={() => handleControl('OFF', mode)}
          disabled={loading || status === 'OFF'}
          className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all min-h-[44px] ${
            status === 'OFF'
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-rose-600 hover:bg-rose-700 text-white shadow-md hover:shadow-rose-600/30'
          }`}
        >
          <Power className="w-4 h-4" /> {t('btn_turn_motor_off')}
        </button>
      </div>

      {/* Mode Description & Safety Warning */}
      <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
        {mode === 'AUTO' ? (
          <p className="flex items-center gap-1.5 text-emerald-800 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>AUTO: Pump triggers automatically when soil moisture drops below 40% and tank has sufficient water.</span>
          </p>
        ) : (
          <p className="text-slate-500">
            MANUAL: Direct control mode. You explicitly start or stop irrigation.
          </p>
        )}
      </div>

      {error && (
        <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default MotorControl;
