
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { geminiService } from '../services/geminiService';
import { Minifigure } from '../types';

interface MinifigFinderProps {
  allMinifigs: Minifigure[];
}

const MinifigFinder: React.FC<MinifigFinderProps> = ({ allMinifigs }) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [scanStatus, setScanStatus] = useState("");
  const [error, setError] = useState<{title: string, msg: string, isQuota: boolean} | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!uploadedPreview) {
      startCamera();
    } else {
      setIsCameraReady(true);
    }
    return () => stopCamera();
  }, [uploadedPreview]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', 
          width: { ideal: 1920 }, 
          height: { ideal: 1080 } 
        }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true);
        };
      }
    } catch (err) {
      setError({ title: "Camera Error", msg: "Please grant camera permission.", isQuota: false });
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(t => t.stop());
    setIsCameraReady(false);
  };

  const processImage = async (source: HTMLVideoElement | HTMLImageElement): Promise<string | null> => {
    if (!canvasRef.current) return null;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    let sw, sh;
    if (source instanceof HTMLVideoElement) {
      sw = source.videoWidth;
      sh = source.videoHeight;
    } else {
      sw = source.width;
      sh = source.height;
    }

    const size = Math.min(sw, sh);
    const sx = (sw - size) / 2;
    const sy = (sh - size) / 2;

    canvas.width = 1024;
    canvas.height = 1024;
    ctx.drawImage(source, sx, sy, size, size, 0, 0, 1024, 1024);
    return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
  };

  const handleScan = async () => {
    if (isScanning || !isCameraReady) return;
    setError(null);

    let base64 = "";
    try {
      setIsScanning(true);
      setScanStatus("ANALYZING VISUALS...");
      
      if (uploadedPreview) {
        const img = new Image();
        img.src = uploadedPreview;
        await new Promise((resolve) => (img.onload = resolve));
        base64 = await processImage(img) || "";
      } else if (videoRef.current) {
        base64 = await processImage(videoRef.current) || "";
      }

      if (!base64) throw new Error("IMAGE_CAPTURE_FAILED");

      // Identification Logic
      const result = await geminiService.identifyWithVector(base64);
      
      setScanStatus("MATCHING VECTOR SIGNATURE...");

      if (result) {
        // Final UI pause for dramatic effect / readability
        setScanStatus("MATCH FOUND!");
        await new Promise(r => setTimeout(r, 600));
        const minifig = allMinifigs.find(m => m.item_no === result.item_no);
        if (minifig) {
          navigate(`/minifig/${result.item_no}/${encodeURIComponent(minifig.name.replace(/\s+/g, '-').toLowerCase())}`);
        }
      } else {
        throw new Error("No similar items detected in the database.");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage === "QUOTA_EXCEEDED") {
        setError({ 
          title: "Limit Reached", 
          msg: "AI capacity reached. Please try manual search or wait a minute.", 
          isQuota: true
        });
      } else {
        setError({ title: "Scan Failed", msg: errorMessage || "Connection error.", isQuota: false });
      }
    } finally {
      setIsScanning(false);
      setScanStatus("");
    }
  };

  return (
    <div className="fixed inset-0 z-[500] bg-slate-950 flex flex-col font-['Outfit'] overflow-hidden">
      {/* Background Cam View */}
      <div className="absolute inset-0 z-0">
        {!uploadedPreview ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover transition-opacity duration-1000 ${isCameraReady ? 'opacity-40' : 'opacity-0'}`} 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-900">
             <img src={uploadedPreview} className="w-full h-full object-contain opacity-30 blur-md" alt="" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/90"></div>
      </div>

      {/* Center Viewfinder */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 pt-10">
        <div className="relative w-[90%] max-w-[500px] aspect-square flex items-center justify-center">
          <div className={`absolute inset-0 border-2 rounded-[3.5rem] transition-all duration-700 ${isScanning ? 'border-indigo-400 scale-[1.03] shadow-[0_0_120px_rgba(99,102,241,0.5)]' : 'border-white/10 shadow-2xl shadow-black/80'}`}>
            <div className={`absolute -top-1 -left-1 w-16 h-16 border-t-[8px] border-l-[8px] rounded-tl-[4rem] transition-colors ${isScanning ? 'border-indigo-400' : 'border-white/40'}`}></div>
            <div className={`absolute -top-1 -right-1 w-16 h-16 border-t-[8px] border-r-[8px] rounded-tr-[4rem] transition-colors ${isScanning ? 'border-indigo-400' : 'border-white/40'}`}></div>
            <div className={`absolute -bottom-1 -left-1 w-16 h-16 border-b-[8px] border-l-[8px] rounded-bl-[4rem] transition-colors ${isScanning ? 'border-indigo-400' : 'border-white/40'}`}></div>
            <div className={`absolute -bottom-1 -right-1 w-16 h-16 border-b-[8px] border-r-[8px] rounded-br-[4rem] transition-colors ${isScanning ? 'border-indigo-400' : 'border-white/40'}`}></div>
          </div>

          <div className="absolute inset-4 overflow-hidden rounded-[3rem] flex items-center justify-center bg-black/5">
            {uploadedPreview && (
              <img src={uploadedPreview} className="w-full h-full object-cover animate-in fade-in duration-500" alt="Preview" />
            )}
            {isScanning && (
              <>
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent absolute top-0 animate-[scan_3s_linear_infinite] z-20"></div>
                <div className="absolute inset-0 bg-indigo-500/10 backdrop-blur-[2px] flex items-center justify-center z-10">
                   <div className="w-20 h-20 border-[6px] border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="h-24 flex flex-col items-center justify-center mt-10">
          {scanStatus ? (
            <div className="text-center">
              <span className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.6em] italic drop-shadow-xl animate-pulse">{scanStatus}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 opacity-50">
               <i className="fas fa-expand text-white text-sm animate-pulse"></i>
               <p className="text-[10px] font-black text-white uppercase tracking-[0.5em] italic">Vector Scanner Ready</p>
            </div>
          )}
        </div>

        {error && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center px-6 bg-slate-950/80 backdrop-blur-md">
            <div className="w-full max-w-xs bg-slate-900 border border-white/5 p-10 rounded-[4rem] text-center shadow-4xl animate-in zoom-in-95 duration-400">
              <div className="w-16 h-16 bg-rose-500/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 text-rose-500">
                <i className="fas fa-exclamation-triangle text-2xl"></i>
              </div>
              <h3 className="text-white text-[14px] font-black uppercase tracking-widest mb-4">{error.title}</h3>
              <p className="text-slate-500 text-[12px] leading-relaxed mb-10 font-medium px-4">{error.msg}</p>
              
              <div className="space-y-4">
                <button 
                  onClick={() => { setUploadedPreview(null); setError(null); startCamera(); }} 
                  className="w-full h-16 bg-white/5 border border-white/10 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all"
                >
                  Retry Scan
                </button>
                <button 
                  onClick={() => navigate(`/search?q=`)} 
                  className="w-full h-16 bg-indigo-600 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                >
                  Manual Search
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="h-48 bg-slate-950/50 backdrop-blur-3xl flex items-center justify-between px-10 pb-12 relative z-50 border-t border-white/5">
        <button onClick={() => navigate(-1)} className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 text-white flex items-center justify-center active:scale-90 transition-all">
          <i className="fas fa-chevron-left text-lg"></i>
        </button>
        
        <button 
          onClick={handleScan} 
          disabled={isScanning || !isCameraReady} 
          className={`w-32 h-32 rounded-full border-[14px] transition-all duration-700 relative ${isScanning ? 'border-indigo-900/30' : !isCameraReady ? 'border-white/5 opacity-40' : 'border-white/5 active:scale-90'}`}
        >
          <div className={`w-full h-full rounded-full flex items-center justify-center transition-all duration-500 ${isScanning ? 'bg-indigo-600 scale-90 shadow-[0_0_60px_rgba(99,102,241,0.7)]' : 'bg-white'}`}>
            {isScanning ? (
              <i className="fas fa-microchip text-white text-4xl animate-pulse"></i>
            ) : (
              <i className="fas fa-camera text-slate-950 text-5xl"></i>
            )}
          </div>
        </button>

        <button onClick={() => fileInputRef.current?.click()} className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 text-white flex items-center justify-center active:scale-90 transition-all">
          <i className="fas fa-image text-lg"></i>
        </button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => { setUploadedPreview(ev.target?.result as string); setError(null); };
          reader.readAsDataURL(file);
        }
      }} />
      <canvas ref={canvasRef} className="hidden" />

      <style>{`
        @keyframes scan {
          0% { top: -10%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default MinifigFinder;
