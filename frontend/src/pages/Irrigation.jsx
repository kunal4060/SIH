import React, { useState, useEffect } from 'react';
import { Droplet, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MotorControl from '../components/MotorControl';
import { motorAPI } from '../services/api';

const Irrigation = () => {
  const { t } = useAuth();
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    try {
      const res = await motorAPI.getLogs();
      setLogs(res.data);
    } catch (err) {
      console.error("Motor log error:", err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-5 sm:space-y-6 content-padding w-full">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <Droplet className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600 shrink-0" />
          <span>{t('irrigation_title')}</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">{t('irrigation_subtitle')}</p>
      </div>

      <MotorControl onStateChange={fetchLogs} />

      {/* Audit Logs */}
      <div className="farm-card p-4 sm:p-6 bg-white border border-slate-200 w-full">
        <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-slate-600 shrink-0" />
          <span>{t('motor_audit_logs')}</span>
        </h3>
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full min-w-[480px] text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold uppercase">
                <th className="p-3 rounded-l-xl">{t('th_timestamp')}</th>
                <th className="p-3">{t('th_action')}</th>
                <th className="p-3">{t('th_mode')}</th>
                <th className="p-3 rounded-r-xl">{t('th_reason')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="p-3 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                      log.action === 'ON' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">{log.mode}</td>
                  <td className="p-3 text-slate-600 min-w-[150px]">{log.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Irrigation;
