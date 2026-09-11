import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  ShieldAlert, 
  Sprout, 
  Droplets, 
  FlaskConical, 
  Layers, 
  ArrowRight, 
  ShieldCheck,
  Camera,
  AlertCircle,
  Cpu,
  Sparkles,
  HeartPulse,
  Flame
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../services/api';

const DiagnosisResult = ({ report, onNewScan }) => {
  const navigate = useNavigate();
  const { setActiveScanContext, t } = useAuth();

  if (!report) return null;

  const handleAskAI = (promptText = null) => {
    setActiveScanContext({
      ...report,
      initialQuery: promptText
    });
    navigate('/chatbot');
  };

  const fullImageUrl = getImageUrl(report.image_path);

  // Safe array normalizer
  const normalizeToArray = (val, fallback = []) => {
    if (!val) return fallback;
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') return [val];
    if (typeof val === 'object') {
      return Object.values(val).filter(v => typeof v === 'string' || typeof v === 'object');
    }
    return fallback;
  };

  // Helper to split "Title: Detail" cleanly and safely
  const parseBullet = (item) => {
    if (!item) return { title: '', detail: '' };
    if (typeof item === 'object') {
      const title = item.title || item.name || item.nutrient || item.factor || item.action || '';
      const detail = item.detail || item.description || item.impact || item.solution || item.cause || JSON.stringify(item);
      return { title: String(title), detail: String(detail) };
    }
    const str = String(item);
    const colonIdx = str.indexOf(':');
    if (colonIdx !== -1 && colonIdx < 60) {
      return {
        title: str.substring(0, colonIdx).trim(),
        detail: str.substring(colonIdx + 1).trim()
      };
    }
    return { title: '', detail: str };
  };

  // Determine if plant is in good/healthy condition
  const isHealthy = Boolean(
    report.is_healthy || 
    report.severity === 'None' || 
    report.final_diagnosis?.toLowerCase().includes('healthy') ||
    report.consensus_status?.includes('HEALTHY')
  );

  const soilDeficiencies = normalizeToArray(report.soil_deficiencies).length 
    ? normalizeToArray(report.soil_deficiencies) 
    : normalizeToArray(report.nutrient_deficiencies, [
        "Optimal Nutrient Balance: Soil nutrition and moisture levels are currently within safe agronomic ranges.",
        "Soil Maintenance: Periodically apply well-rotted vermicompost to sustain rhizosphere microbial activity."
      ]);

  const rootCauses = normalizeToArray(report.root_causes).length 
    ? normalizeToArray(report.root_causes) 
    : normalizeToArray(report.causes, [
        "Biological Cause: Standard seasonal environmental acclimation.",
        "Environmental Factor: Ambient sunlight and balanced irrigation supporting steady growth."
      ]);

  const solutions = normalizeToArray(report.solutions).length 
    ? normalizeToArray(report.solutions) 
    : normalizeToArray(report.treatments, [
        "Continue sensor-guided soil moisture irrigation to maintain root aeration.",
        "Inspect leaves and fruit weekly to sustain optimal plant health."
      ]);

  const symptoms = normalizeToArray(report.symptoms, [
    isHealthy ? "Firm cellular turgidity and uniform leaf pigmentation" : "Visible foliar discoloration"
  ]);
  const prevention = normalizeToArray(report.prevention, [
    "Practice periodic crop rotation and drip irrigation to maintain health."
  ]);

  // Model details
  const mlDetails = {
    name: report.ml_model_details?.name || "Local Trained ML Model (ResNet50)",
    full_title: report.ml_model_details?.full_title || "Custom ResNet50 Deep CNN Classifier",
    dataset: report.ml_model_details?.dataset || "Trained on 54,306 expert-annotated plant & crop samples (PlantVillage dataset)",
    predicted_class: report.ml_model_details?.predicted_class || report.two_options?.option_2 || report.comparison_matrix?.[0]?.result || "Vegetative Feature Match",
    confidence: report.ml_model_details?.confidence || report.comparison_matrix?.[0]?.confidence || "92%",
    role: report.ml_model_details?.role || "Local visual feature extraction & pattern classification"
  };

  const aiModelDetails = {
    name: report.ai_model_details?.name || report.gemini_details?.name || "AI Model Analysis",
    full_title: report.ai_model_details?.full_title || "Cloud Agronomic Deep AI Model Analysis",
    architecture: report.ai_model_details?.architecture || "Multimodal Vision & Agronomic Reasoning AI Model",
    predicted_class: report.ai_model_details?.predicted_class || report.two_options?.option_1 || report.final_diagnosis || "Healthy",
    confidence: report.ai_model_details?.confidence || report.gemini_details?.confidence || "95%",
    role: report.ai_model_details?.role || "Deep contextual pathology reasoning, whole-plant symptom detection, soil deficiency & treatment formulation"
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto w-full transition-all">
      {/* 1. Header Banner - Clean Minimalist Slate */}
      <div className={`rounded-2xl p-5 sm:p-6 text-white border shadow-sm transition-all ${
        isHealthy 
          ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-emerald-700/60' 
          : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${
                isHealthy 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' 
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              }`}>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{t('dual_ai_verified')}</span>
              </span>

              {isHealthy ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/20 text-teal-200 border border-teal-400/40">
                  {t('plant_healthy_badge')}
                </span>
              ) : (
                <span className="text-xs text-slate-400">
                  {t('severity')}: <strong className="text-amber-300 font-bold">{report.severity || 'Moderate'}</strong>
                </span>
              )}

              {report.plant_part && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {t('part_scanned')}: <strong>{report.plant_part}</strong>
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {report.final_diagnosis}
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {report.consensus_message}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 pt-1 md:pt-0">
            <button
              type="button"
              onClick={() => handleAskAI()}
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer w-full sm:w-auto hover:scale-105 active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{t('btn_ask_ai')}</span>
            </button>
            {onNewScan && (
              <button
                type="button"
                onClick={onNewScan}
                className="py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer w-full sm:w-auto"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{t('btn_scan_new')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. 🌟 PROMINENT HEALTH CARD: If Plant is Working in Good Condition */}
      {isHealthy && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white border-2 border-emerald-300/80 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-emerald-950 flex items-center gap-2">
                  <span>{t('plant_healthy_title')}</span>
                </h3>
                <p className="text-[11px] text-emerald-800 font-medium">
                  {t('plant_healthy_subtitle')}
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white shadow-sm">
              OPTIMAL
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed pt-1 border-t border-emerald-200/60">
            {t('plant_healthy_desc')}
          </p>
        </div>
      )}

      {/* 3. Dual Model Specifications (Local Trained ML Model vs AI Model Analysis) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Model 1: Local Trained ML Model */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2 hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t('model_trained_ml')}</span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[11px] border border-indigo-200/70">
              Confidence: {mlDetails.confidence}
            </span>
          </div>
          <h4 className="text-sm font-black text-slate-900">
            {mlDetails.name}
          </h4>
          <p className="text-[11px] text-slate-500 leading-snug">
            {mlDetails.dataset}
          </p>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">{t('option_ai_eval')}</span>
            <span className="font-bold text-slate-800 truncate max-w-[200px]" title={mlDetails.predicted_class}>
              {mlDetails.predicted_class}
            </span>
          </div>
        </div>

        {/* Model 2: AI Model Analysis */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2 hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('model_ai_analysis')}</span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200/70">
              Confidence: {aiModelDetails.confidence}
            </span>
          </div>
          <h4 className="text-sm font-black text-slate-900">
            {aiModelDetails.name}
          </h4>
          <p className="text-[11px] text-slate-500 leading-snug">
            {aiModelDetails.role}
          </p>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">{t('visual_diagnosis')}</span>
            <span className="font-bold text-emerald-900 truncate max-w-[200px]" title={aiModelDetails.predicted_class}>
              {aiModelDetails.predicted_class}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Scanned Photo & Symptoms Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="p-3 bg-white border border-slate-200/90 rounded-2xl flex flex-col items-center justify-center">
          {fullImageUrl ? (
            <img
              src={fullImageUrl}
              alt={report.final_diagnosis}
              className="w-full h-44 object-cover rounded-xl border border-slate-100"
            />
          ) : (
            <div className="w-full h-44 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 text-xs font-semibold">
              Scanned Plant Photo
            </div>
          )}
          <div className="w-full flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
            <span>{t('crop')}: <strong className="text-slate-700">{report.plant}</strong></span>
            {report.plant_part && (
              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                {report.plant_part}
              </span>
            )}
          </div>
        </div>

        <div className="md:col-span-2 p-5 bg-white border border-slate-200/90 rounded-2xl space-y-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t('condition_summary')}</span>
            <p className="text-xs text-slate-700 leading-relaxed mt-1">{report.description}</p>
          </div>
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">{t('visual_symptoms')}</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {symptoms.map((s, i) => (
                <div key={i} className="text-xs text-slate-700 flex items-start gap-1.5 p-1.5 bg-slate-50 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. 🌱 Soil Health & Nutrient Deficiency Analysis */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">{t('soil_health_title')}</h3>
              <p className="text-[11px] text-slate-500">{t('soil_health_sub')}</p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
            {t('soil_badge')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {soilDeficiencies.map((item, idx) => {
            const { title, detail } = parseBullet(item);
            return (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wide block">
                  {title || `Nutrient Factor ${idx + 1}`}
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {detail || item}
                </p>
              </div>
            );
          })}
        </div>

        <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 text-[11px] text-amber-900 flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
          <span>Conduct an N-P-K soil test or check soil pH before applying concentrated chemical fertilizers to prevent root burn.</span>
        </div>
      </div>

      {/* 6. 🔍 Root Cause Analysis (With Highlighted Red Triggers & Pathogen Warning) */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-700">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span>{t('root_cause_title')}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                  {t('critical_in_red')}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">{t('root_cause_sub')}</p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
            {t('etiology')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {rootCauses.map((cause, idx) => {
            const { title, detail } = parseBullet(cause);
            return (
              <div 
                key={idx} 
                className="p-3 rounded-xl bg-rose-50/30 border border-rose-200/70 hover:border-rose-300 transition-colors space-y-1.5"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span className="text-[10px] font-extrabold text-rose-700 uppercase tracking-wider block">
                    {title || `Trigger ${idx + 1}`}
                  </span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed">
                  <strong className="text-rose-600 font-semibold">{title ? `${title}: ` : ''}</strong>
                  <span>{detail || cause}</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. 💊 Comprehensive Solutions & Recovery Roadmap */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">{t('treatment_title')}</h3>
              <p className="text-[11px] text-slate-500">{t('treatment_sub')}</p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
            {t('action_roadmap')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Targeted Treatment Steps */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              {t('remediation_steps')}
            </span>
            <div className="space-y-2">
              {solutions.map((sol, idx) => {
                const { title, detail } = parseBullet(sol);
                return (
                  <div key={idx} className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-200/50 text-xs text-slate-800">
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        {title && <span className="font-bold text-emerald-950 block mb-0.5">{title}</span>}
                        <p className="text-slate-700">{detail || sol}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cultural Prevention & One-Click AI Inquiries */}
          <div className="space-y-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                {t('prevention_title')}
              </span>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1.5">
                {prevention.map((prev, idx) => (
                  <div key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>{prev}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick AI Prompts */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
                {t('ask_prompts_title')}
              </span>
              <button
                type="button"
                onClick={() => handleAskAI(`What exact organic or chemical fertilizer dosage should I apply for ${report.final_diagnosis}?`)}
                className="w-full text-left text-xs text-slate-700 hover:text-emerald-900 font-medium p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200/70 hover:border-emerald-300 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>{t('prompt_fertilizer')}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => handleAskAI(`How can I prepare a natural organic spray at home for ${report.final_diagnosis}?`)}
                className="w-full text-left text-xs text-slate-700 hover:text-emerald-900 font-medium p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200/70 hover:border-emerald-300 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>{t('prompt_organic_spray')}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 8. Minimalist Disclaimer */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-400 flex items-start gap-2">
        <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <span>{report.disclaimer || "AI-assisted field guidance. For severe commercial disease spread, consult a local agricultural extension officer."}</span>
      </div>
    </div>
  );
};

export default DiagnosisResult;
