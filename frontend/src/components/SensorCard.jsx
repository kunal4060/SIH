import React from 'react';
import { useAuth } from '../context/AuthContext';

const SensorCard = ({ title, value, unit, status, icon: Icon, color = 'emerald' }) => {
  const { t } = useAuth();

  const displayTitle = t(title) || title;
  const displayUnit = t(unit) || unit;
  const displayStatus = t(status) || status;

  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-600',
      border: 'border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-800'
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-600',
      border: 'border-amber-200',
      badge: 'bg-amber-100 text-amber-800'
    },
    sky: {
      bg: 'bg-sky-500/10',
      text: 'text-sky-600',
      border: 'border-sky-200',
      badge: 'bg-sky-100 text-sky-800'
    },
    indigo: {
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-600',
      border: 'border-indigo-200',
      badge: 'bg-indigo-100 text-indigo-800'
    }
  }[color] || {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800'
  };

  return (
    <div className={`farm-card p-5 border ${colorClasses.border} relative overflow-hidden`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{displayTitle}</span>
        <div className={`p-2.5 rounded-xl ${colorClasses.bg} ${colorClasses.text}`}>
          <Icon className="w-5 h-5 stroke-[2.2]" />
        </div>
      </div>
      <div className="flex items-baseline gap-1 my-1">
        <span className="text-3xl font-extrabold tracking-tight text-slate-900">{value}</span>
        <span className="text-sm font-semibold text-slate-500">{displayUnit}</span>
      </div>
      {status && (
        <div className="mt-3 flex items-center justify-between">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClasses.badge}`}>
            ● {displayStatus}
          </span>
        </div>
      )}
    </div>
  );
};

export default SensorCard;
