import React, { useState } from 'react';
import { Stethoscope, Sparkles } from 'lucide-react';
import PlantScanner from '../components/PlantScanner';
import DiagnosisResult from '../components/DiagnosisResult';

import { useAuth } from '../context/AuthContext';

const PlantDoctor = () => {
  const [report, setReport] = useState(null);
  const { t } = useAuth();

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-w-5xl mx-auto content-padding w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2 sm:gap-2.5">
            <Stethoscope className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 shrink-0" />
            <span>{t('doctor_title')}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('doctor_subtitle')}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold shrink-0">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>{t('dual_ai_active')}</span>
        </div>
      </div>

      {/* Main Container: Scanner or Results */}
      {!report ? (
        <PlantScanner onAnalysisComplete={(data) => setReport(data)} />
      ) : (
        <DiagnosisResult report={report} onNewScan={() => setReport(null)} />
      )}
    </div>
  );
};

export default PlantDoctor;
