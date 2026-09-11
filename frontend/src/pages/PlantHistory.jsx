import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Search, Filter, ArrowRight, X, Sparkles, Stethoscope, RefreshCw, Sprout, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { plantAPI, getImageUrl } from '../services/api';
import DiagnosisResult from '../components/DiagnosisResult';

const PlantHistory = () => {
  const navigate = useNavigate();
  const { t } = useAuth();
  
  // Optimistic initial load from sessionStorage cache so history loads in 0ms
  const [scans, setScans] = useState(() => {
    try {
      const cached = sessionStorage.getItem('smart_farm_history_cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [selectedScanDetail, setSelectedScanDetail] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await plantAPI.getHistory(search);
      const data = Array.isArray(res.data) ? res.data : [];
      setScans(data);
      if (!search && data.length > 0) {
        sessionStorage.setItem('smart_farm_history_cache', JSON.stringify(data));
      }
    } catch (err) {
      console.error("History fetch error:", err);
      setFetchError("Unable to fetch fresh records. Displaying cached scans if available.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHistory();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const openScanDetail = async (id, fallbackScan = null) => {
    setModalLoading(true);
    try {
      const res = await plantAPI.getScanDetail(id);
      const detail = res.data;
      if (fallbackScan && !detail.thumbnail && fallbackScan.thumbnail) {
        detail.thumbnail = fallbackScan.thumbnail;
      }
      setSelectedScanDetail(detail);
    } catch (err) {
      console.error("Scan detail fetch error:", err);
      if (fallbackScan) {
        setSelectedScanDetail({
          plant: fallbackScan.plant,
          final_diagnosis: fallbackScan.diagnosis,
          severity: fallbackScan.severity,
          confidence_level: fallbackScan.confidence,
          consensus_status: fallbackScan.consensus,
          thumbnail: fallbackScan.thumbnail,
          image_path: fallbackScan.imagePath,
          preview_image: fallbackScan.thumbnail || (fallbackScan.imagePath ? getImageUrl(fallbackScan.imagePath) : null)
        });
      }
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-5 sm:space-y-6 content-padding w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0" />
            <span>{t('history_title')}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('history_subtitle')}
          </p>
        </div>

        {/* Controls: Search + Refresh Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('history_search_placeholder')}
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:border-emerald-500 min-h-[44px]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          </div>

          <button
            type="button"
            onClick={fetchHistory}
            disabled={loading}
            className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm min-h-[44px] disabled:opacity-60"
            title="Refresh scan records from cloud database"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Error / Notice Alert */}
      {fetchError && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{fetchError}</span>
          </div>
          <button
            onClick={fetchHistory}
            className="font-bold underline text-amber-900 cursor-pointer text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Grid of Scans */}
      {loading && scans.length === 0 ? (
        <div className="py-16 text-center text-slate-500 font-medium text-xs space-y-3">
          <div className="w-9 h-9 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-semibold">Connecting to cloud database & fetching scan history...</p>
        </div>
      ) : scans.length === 0 ? (
        <div className="farm-card p-8 sm:p-12 text-center bg-white border border-slate-200 space-y-3">
          <Sparkles className="w-10 h-10 text-emerald-500/50 mx-auto" />
          <h3 className="font-bold text-base text-slate-800">{t('history_empty')}</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">{t('history_empty_sub')}</p>
          <button
            type="button"
            onClick={() => navigate('/plant-doctor')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-all cursor-pointer shadow-sm mt-2"
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Scan Plant Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
          {scans.map((scan) => {
            const photoUrl = scan.thumbnail || (scan.imagePath ? getImageUrl(scan.imagePath) : null);

            return (
              <div
                key={scan.id}
                onClick={() => openScanDetail(scan.id, scan)}
                className="farm-card p-4 sm:p-5 bg-white border border-slate-200 hover:border-emerald-400 cursor-pointer transition-all hover:shadow-lg group"
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-3">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-slate-200 shadow-sm shrink-0 bg-slate-100 flex items-center justify-center">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={scan.diagnosis}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null}
                    <Sprout className="w-6 h-6 text-emerald-600 absolute opacity-70 -z-0" />
                  </div>

                  <div className="truncate flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block">
                        {scan.plant}
                      </span>
                      {scan.severity && scan.severity !== 'None' && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                          {scan.severity}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate mt-1" title={scan.diagnosis}>
                      {scan.diagnosis}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{scan.date}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">
                    {t('th_confidence')}{' '}
                    <strong className="text-emerald-700">{scan.confidence}</strong>
                  </span>
                  <span className="flex items-center gap-1 font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
                    {t('view_report')} <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedScanDetail && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="farm-card bg-white max-w-4xl w-full p-4 sm:p-6 my-4 sm:my-8 rounded-2xl sm:rounded-3xl max-h-[92vh] overflow-y-auto relative">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const detail = selectedScanDetail;
                  setSelectedScanDetail(null);
                  navigate('/plant-doctor', { state: { report: detail } });
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer border border-emerald-200"
              >
                <Stethoscope className="w-4 h-4 text-emerald-600" />
                <span>Open in Plant Doctor Tab</span>
              </button>

              <button
                onClick={() => setSelectedScanDetail(null)}
                className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors z-20 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <DiagnosisResult report={selectedScanDetail} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantHistory;
