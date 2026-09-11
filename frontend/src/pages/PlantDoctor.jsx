import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Stethoscope, Sparkles, History, ArrowRight } from 'lucide-react';
import PlantScanner from '../components/PlantScanner';
import DiagnosisResult from '../components/DiagnosisResult';
import { plantAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PlantDoctor = () => {
  const location = useLocation();
  const [report, setReport] = useState(location.state?.report || null);
  const [latestScan, setLatestScan] = useState(null);
  const { t } = useAuth();

  useEffect(() => {
    if (location.state?.report) {
      setReport(location.state.report);
    }
  }, [location.state]);

  // Check if there is a recent scan in history to offer quick view
  useEffect(() => {
    let isMounted = true;
    const checkLatest = async () => {
      try {
        const res = await plantAPI.getLatestScan();
        if (isMounted && res.data) {
          setLatestScan(res.data);
        }
      } catch (err) {
        // non-blocking
      }
    };
    checkLatest();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-w-5xl mx-auto content-padding w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2 sm:gap-2.5">
            <Stethoscope className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 shrink-0" />
            <span>{t('doctor_title')}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('doctor_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!report && latestScan && (
            <button
              onClick={() => setReport(latestScan)}
              className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold border border-slate-200 hover:border-emerald-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="View your most recent scan analysis"
            >
              <History className="w-3.5 h-3.5 text-emerald-600" />
              <span>View Last Scan ({latestScan.plant || 'Crop'})</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold shrink-0">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>{t('dual_ai_active')}</span>
          </div>
        </div>
      </div>

      {/* Main Container: Scanner or Results */}
      {!report ? (
        <PlantScanner onAnalysisComplete={(data) => {
          setReport(data);
          setLatestScan(data);
        }} />
      ) : (
        <DiagnosisResult report={report} onNewScan={() => setReport(null)} />
      )}
    </div>
  );
};

export default PlantDoctor;
