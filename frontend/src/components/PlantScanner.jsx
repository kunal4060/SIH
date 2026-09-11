import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  FlipHorizontal, 
  Image as ImageIcon,
  Video,
  VideoOff,
  Maximize2
} from 'lucide-react';
import { plantAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PlantScanner = ({ onAnalysisComplete }) => {
  const { t } = useAuth();
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [facingMode, setFacingMode] = useState('environment');
  const [error, setError] = useState(null);
  const [cameraStarting, setCameraStarting] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mobileCameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

  const startCamera = async (targetFacing = facingMode) => {
    setError(null);
    setCameraStarting(true);
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      let mediaStream = null;
      try {
        // Try requested facingMode (ideal for mobile phone rear/front camera)
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: targetFacing }
        });
      } catch (err1) {
        // Fallback for laptop / desktop webcams where 'environment' facingMode is unavailable
        console.info("Target facingMode unavailable, falling back to standard webcam:", err1);
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
      }

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn("Camera stream could not be started:", err);
      setStream(null);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError("Camera permission denied. Please allow camera access in your browser settings, or use the file upload option.");
      } else {
        setError("Live webcam could not be opened on this device. You can snap or select a leaf photo directly using the buttons below.");
      }
    } finally {
      setCameraStarting(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const flipCamera = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    if (stream) {
      startCamera(nextFacing);
    }
  };

  const capturePhotoFromStream = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "camera_snapshot.jpg", { type: "image/jpeg" });
        setImageFile(file);
        setCapturedImage(URL.createObjectURL(blob));
        stopCamera();
      }
    }, 'image/jpeg', 0.95);
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      if (!file || !file.type.startsWith('image/')) return resolve(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1280;
          const MAX_HEIGHT = 1280;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) return resolve(file);
              const compressedFile = new File([blob], "leaf_scan.jpg", {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            0.85
          );
        };
        img.onerror = () => resolve(file);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);
      try {
        const compressed = await compressImage(file);
        setImageFile(compressed);
        const previewUrl = URL.createObjectURL(compressed);
        setCapturedImage(previewUrl);
        stopCamera();
      } catch (err) {
        setImageFile(file);
        setCapturedImage(URL.createObjectURL(file));
        stopCamera();
      }
    }
    e.target.value = '';
  };

  const loadSampleLeaf = async (sampleName) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, 0, 400, 300);
      
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(150, 120, 30, 0, 2 * Math.PI);
      ctx.arc(240, 180, 40, 0, 2 * Math.PI);
      ctx.fill();

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `${sampleName}_leaf.jpg`, { type: "image/jpeg" });
          setImageFile(file);
          setCapturedImage(URL.createObjectURL(blob));
          stopCamera();
        }
      }, 'image/jpeg', 0.95);
    } catch (err) {
      console.error(err);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setImageFile(null);
    setError(null);
  };

  const runAnalysis = async () => {
    if (!imageFile) {
      setError("Please capture or upload a leaf photo first.");
      return;
    }

    setLoading(true);
    setLoadingStep(1);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      setTimeout(() => setLoadingStep(2), 600);
      setTimeout(() => setLoadingStep(3), 1200);
      setTimeout(() => setLoadingStep(4), 1800);

      const res = await plantAPI.analyzeScan(formData);

      setLoadingStep(5);
      setTimeout(() => {
        setLoading(false);
        if (onAnalysisComplete) {
          onAnalysisComplete({
            ...res.data,
            preview_image: capturedImage,
          });
        }
      }, 400);

    } catch (err) {
      setLoading(false);
      const detail = err.response?.data?.detail;
      if (detail) {
        setError(detail);
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError("Analysis request timed out on cold start. Please click 'Analyze Plant Now' once more.");
      } else {
        setError("Failed to analyze plant image. Please upload a clear leaf/plant photo.");
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-6 w-full max-w-2xl mx-auto transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 mb-4 gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Camera className="w-4 h-4" />
            </span>
            <span>{t('scanner_title')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('scanner_subtitle')}
          </p>
        </div>

        {stream && !capturedImage && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={flipCamera}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Flip Camera"
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Flip</span>
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Turn off camera"
            >
              <VideoOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Turn Off</span>
            </button>
          </div>
        )}
      </div>

      {/* Visual Organ Support Badges */}
      <div className="mb-3.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
          {t('supported_uploads')}
        </span>
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-slate-700">
            {t('part_leaves')}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-slate-700">
            {t('part_fruits')}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-slate-700">
            {t('part_stems')}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-slate-700">
            {t('part_flowers')}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-slate-700">
            {t('part_whole')}
          </span>
        </div>
      </div>

      {/* Viewport Box */}
      {!loading ? (
        <div className="space-y-4">
          <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-slate-950 border border-slate-200/80 flex items-center justify-center">
            {!capturedImage ? (
              stream ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Minimalist target reticle overlay */}
                  <div className="absolute inset-8 border border-white/30 rounded-xl pointer-events-none flex items-center justify-center">
                    <div className="w-12 h-12 border-t-2 border-l-2 border-emerald-400 absolute top-0 left-0 rounded-tl-lg" />
                    <div className="w-12 h-12 border-t-2 border-r-2 border-emerald-400 absolute top-0 right-0 rounded-tr-lg" />
                    <div className="w-12 h-12 border-b-2 border-l-2 border-emerald-400 absolute bottom-0 left-0 rounded-bl-lg" />
                    <div className="w-12 h-12 border-b-2 border-r-2 border-emerald-400 absolute bottom-0 right-0 rounded-br-lg" />
                    <span className="text-[11px] font-semibold text-white/90 bg-slate-950/70 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                      {t('align_reticle')}
                    </span>
                  </div>

                  {/* Floating capture shutter button */}
                  <div className="absolute bottom-4 inset-x-0 flex justify-center">
                    <button
                      type="button"
                      onClick={capturePhotoFromStream}
                      className="px-6 py-2.5 rounded-full bg-white hover:bg-emerald-50 text-slate-950 font-black text-xs shadow-xl flex items-center gap-2 border-2 border-emerald-500 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 animate-ping" />
                      <span>{t('btn_start_camera')}</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
                    <Camera className="w-7 h-7 text-emerald-500" />
                  </div>
                  <p className="text-sm font-extrabold text-white">{t('camera_ready')}</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                    {t('camera_hint')}
                  </p>
                  
                  {/* Direct Start Camera Button in placeholder */}
                  <button
                    type="button"
                    onClick={() => startCamera()}
                    disabled={cameraStarting}
                    className="mt-4 px-4 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-105"
                  >
                    <Video className="w-4 h-4" />
                    <span>{cameraStarting ? t('locating') : t('btn_start_camera')}</span>
                  </button>
                </div>
              )
            ) : (
              <img
                src={capturedImage}
                alt="Captured Plant Preview"
                className="w-full h-full object-cover"
              />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Native HTML Camera & Gallery Inputs: Positioned offscreen rather than hidden so Safari/Android never blocks clicks */}
          <input
            ref={mobileCameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            style={{ position: 'fixed', top: '-9999px', left: '-9999px', opacity: 0 }}
            id="mobile-native-camera-input"
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ position: 'fixed', top: '-9999px', left: '-9999px', opacity: 0 }}
            id="gallery-file-picker-input"
          />

          {!capturedImage ? (
            <div className="space-y-3">
              {/* Action Buttons: Minimalist Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Option 1: Mobile Camera Direct / Desktop Webcam */}
                {isMobile ? (
                  <label
                    htmlFor="mobile-native-camera-input"
                    className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-950 font-extrabold text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm hover:shadow cursor-pointer select-none active:scale-95"
                    id="btn-trigger-camera"
                  >
                    <Camera className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{t('btn_mobile_camera')}</span>
                  </label>
                ) : (
                  <button
                    type="button"
                    onClick={() => startCamera()}
                    className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-950 font-extrabold text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm hover:shadow cursor-pointer"
                    id="btn-trigger-camera"
                  >
                    <Camera className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{t('btn_desktop_camera')}</span>
                  </button>
                )}

                {/* Option 2: Upload photo from files/gallery */}
                <label
                  htmlFor="gallery-file-picker-input"
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm hover:shadow cursor-pointer select-none active:scale-95"
                  id="btn-trigger-gallery"
                >
                  <Upload className="w-4 h-4 text-slate-600 shrink-0" />
                  <span>{t('btn_upload_gallery')}</span>
                </label>
              </div>

              {/* Quick Demo Test Buttons */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
                <span className="text-[11px] font-semibold text-slate-400">{t('quick_test_samples')}</span>
                <button
                  type="button"
                  onClick={() => loadSampleLeaf('tomato_early_blight')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 font-bold transition-colors cursor-pointer text-[11px]"
                >
                  {t('sample_leaf_blight')}
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleLeaf('apple_fruit_spot')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-900 font-bold transition-colors cursor-pointer text-[11px]"
                >
                  {t('sample_fruit_spot')}
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleLeaf('healthy_foliage')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-900 font-bold transition-colors cursor-pointer text-[11px]"
                >
                  {t('sample_healthy')}
                </button>
              </div>
            </div>
          ) : (
            /* Post-capture Preview & Action Bar */
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={retakePhoto}
                  className="py-3 px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{t('btn_retake')}</span>
                </button>

                <button
                  type="button"
                  onClick={runAnalysis}
                  className="py-3 px-6 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                  id="btn-analyze-leaf"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{t('btn_analyze_now')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Minimalist Progress Loader */
        <div className="py-8 px-4 text-center space-y-5">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto animate-bounce">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">{t('analysis_in_progress')}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{t('evaluating_features')}</p>
          </div>

          <div className="max-w-md mx-auto space-y-2 text-left bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
            <div className="flex items-center gap-2.5">
              {loadingStep >= 1 ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />}
              <span className={loadingStep >= 1 ? 'font-bold text-slate-900' : 'text-slate-400'}>{t('step_1')}</span>
            </div>
            <div className="flex items-center gap-2.5">
              {loadingStep >= 2 ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0 animate-pulse" />}
              <span className={loadingStep >= 2 ? 'font-bold text-slate-900' : 'text-slate-400'}>{t('step_2')}</span>
            </div>
            <div className="flex items-center gap-2.5">
              {loadingStep >= 3 ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0 animate-pulse" />}
              <span className={loadingStep >= 3 ? 'font-bold text-slate-900' : 'text-slate-400'}>{t('step_3')}</span>
            </div>
            <div className="flex items-center gap-2.5">
              {loadingStep >= 4 ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />}
              <span className={loadingStep >= 4 ? 'font-bold text-slate-900' : 'text-slate-400'}>{t('step_4')}</span>
            </div>
            <div className="flex items-center gap-2.5">
              {loadingStep >= 5 ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />}
              <span className={loadingStep >= 5 ? 'font-bold text-slate-900' : 'text-slate-400'}>{t('step_5')}</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default PlantScanner;
