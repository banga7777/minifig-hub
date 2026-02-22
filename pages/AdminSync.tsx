
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { GoogleGenAI } from "@google/genai";

const BATCH_SIZE = 5; 
const DELAY_BETWEEN_BATCHES = 1500; 

const AdminSync: React.FC = () => {
  const navigate = useNavigate();
  const [totalToProcess, setTotalToProcess] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [status, setStatus] = useState("Ready to build vector database");
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { count, error } = await supabase
      .from('minifigures')
      .select('*', { count: 'exact', head: true })
      .is('embedding', null);
    
    if (!error && count !== null) {
      setTotalToProcess(count);
    }
  };

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 10));
  };

  const startSync = async () => {
    if (isSyncing || totalToProcess === 0) return;
    setIsSyncing(true);
    setStatus("INITIALIZING AI PIPELINE...");
    
    // Create AI instance inside the sync process to ensure fresh API key context
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let currentProcessed = 0;

    try {
      while (currentProcessed < totalToProcess) {
        setStatus(`PROCESSING BATCH: ${currentProcessed} / ${totalToProcess}`);
        
        const { data: targets, error: fetchError } = await supabase
          .from('minifigures')
          .select('item_no, name_en, main_category')
          .is('embedding', null)
          .limit(BATCH_SIZE);

        if (fetchError || !targets || targets.length === 0) break;

        for (const item of targets) {
          try {
            const textToEmbed = `${item.name_en || ''} ${item.main_category || ''}`.trim();
            if (!textToEmbed) {
              currentProcessed++;
              continue;
            }

            // [FIX]: Reverted to embedContent as batchEmbedContents is not supported on ai.models
            const result = await ai.models.embedContent({
              model: 'text-embedding-004',
              contents: { parts: [{ text: textToEmbed }] },
              config: {
                taskType: 'RETRIEVAL_DOCUMENT'
              }
            });

            const embedding = result.embeddings?.[0];
            if (!embedding || !embedding.values) {
              throw new Error("INVALID_EMBEDDING_RESPONSE");
            }

            const vector = embedding.values;

            const { error: updateError } = await supabase
              .from('minifigures')
              .update({ embedding: vector })
              .eq('item_no', item.item_no);

            if (updateError) throw updateError;

            currentProcessed++;
            setProcessedCount(currentProcessed);
            addLog(`SUCCESS: [${item.item_no}] Vectorized`);
          } catch (err: any) {
            console.error(`Error on ${item.item_no}:`, err);
            addLog(`ERROR: [${item.item_no}] ${err.message}`);
            // Small extra delay on error
            await new Promise(r => setTimeout(r, 2000));
          }
        }

        // Standard delay between batches
        await new Promise(r => setTimeout(r, DELAY_BETWEEN_BATCHES));
      }

      setStatus("DATABASE SYNC COMPLETE");
      addLog("ALL TARGETS PROCESSED SUCCESSFULLY");
    } catch (err: any) {
      setStatus("SYNC INTERRUPTED");
      addLog(`FATAL ERROR: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const progress = totalToProcess > 0 ? (processedCount / totalToProcess) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 font-['Outfit']">
      <div className="w-full max-w-md bg-slate-900 border border-white/5 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
        
        <header className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl rotate-3">
             <i className="fas fa-microchip text-white text-2xl"></i>
          </div>
          <h1 className="text-white font-black text-xl italic uppercase tracking-tighter">Vector <span className="text-indigo-500">Sync Engine</span></h1>
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mt-2">AI Database Builder v2.3</p>
        </header>

        <div className="space-y-8">
          <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
             <div className="flex justify-between items-end mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Items</span>
                <span className="text-2xl font-black text-white">{totalToProcess - processedCount}</span>
             </div>
             <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-500" 
                  style={{ width: `${progress}%` }}
                ></div>
             </div>
             <p className="text-center text-[9px] font-bold text-slate-500 mt-4 uppercase tracking-widest">{processedCount} / {totalToProcess} COMPLETED</p>
          </div>

          <div className="text-center">
            <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 animate-pulse">{status}</p>
            
            <button 
              onClick={startSync}
              disabled={isSyncing || totalToProcess === 0}
              className={`w-full h-16 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                isSyncing ? 'bg-slate-800 text-slate-500' : 'bg-white text-slate-950 hover:bg-indigo-50'
              }`}
            >
              {isSyncing ? (
                <>
                  <i className="fas fa-spinner animate-spin"></i>
                  Syncing...
                </>
              ) : (
                <>
                  <i className="fas fa-bolt"></i>
                  Start AI Build
                </>
              )}
            </button>
          </div>

          <div className="bg-black/30 rounded-xl p-4 h-32 overflow-y-auto font-mono text-[9px] text-slate-500 space-y-1 custom-scrollbar">
            {logs.map((log, i) => (
              <div key={i} className="border-b border-white/5 pb-1">{log}</div>
            ))}
            {logs.length === 0 && <div className="text-center py-8 italic">System logs ready...</div>}
          </div>

          <button 
            onClick={() => navigate('/')} 
            className="w-full py-4 text-slate-600 text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSync;
