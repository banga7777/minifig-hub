import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useParams, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minifigure } from '../types';
import MinifigCard from '../components/MinifigCard';
import SEO from '../components/SEO';
import { MANDALORIAN_DATA, ELITE_CLONE_DATA, IMPERIAL_GUARD_DATA, EliteSection } from '../src/constants/eliteData';

interface EliteSpecialistsProps {
  allMinifigs: Minifigure[];
  onToggleOwned: (id: string) => void;
}

const EliteSubArchive = ({ allMinifigs, onToggleOwned, faction }: { allMinifigs: Minifigure[], onToggleOwned: (id: string) => void, faction: 'mandalorians' | 'elite-clones' | 'imperial-guards' }) => {
  const { subId } = useParams();
  const navigate = useNavigate();

  const data = useMemo(() => {
    if (faction === 'mandalorians') return MANDALORIAN_DATA;
    if (faction === 'elite-clones') return ELITE_CLONE_DATA;
    return IMPERIAL_GUARD_DATA;
  }, [faction]);

  const subSection = useMemo(() => {
    for (const section of data) {
      const found = section.subsections.find(s => s.id === subId);
      if (found) return { section, sub: found };
    }
    return null;
  }, [data, subId]);

  if (!subSection) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Sub-archive not found</div>;

  const getFigs = (ids: string[]) => 
    allMinifigs
      .filter(m => ids.includes(m.item_no))
      .sort((a, b) => a.item_no.localeCompare(b.item_no));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-6">
      <SEO 
        title={`${subSection.sub.name} | LEGO Star Wars Master Archive`}
        description={subSection.sub.desc || `Detailed archive of LEGO ${subSection.sub.name} minifigures.`}
      />
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-colors group"
        >
          <i className="fas fa-arrow-left text-xs group-hover:-translate-x-1 transition-transform"></i>
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Archive</span>
        </button>

        <header className="mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-6">
            {subSection.sub.name}
          </h1>
          {subSection.sub.desc && (
            <p className="text-slate-400 text-lg leading-relaxed max-w-3xl border-l-4 border-indigo-500 pl-6">
              {subSection.sub.desc}
            </p>
          )}
        </header>

        <div className="space-y-16">
          {subSection.sub.items.map((item, iIdx) => {
            const figs = getFigs(item.ids);
            if (figs.length === 0) return null;
            return (
              <div key={iIdx}>
                <div className="mb-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    {item.label}
                    <span className="text-slate-600">({figs.length})</span>
                  </h4>
                  {item.desc && <p className="text-slate-500 text-[10px] leading-relaxed max-w-xl">{item.desc}</p>}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {figs.map(m => (
                    <MinifigCard 
                      key={m.item_no} 
                      minifig={m} 
                      variant="dark"
                      onToggleOwned={onToggleOwned}
                      onClick={() => navigate(`/minifigs/${m.item_no}-${m.name.toLowerCase().replace(/ /g, '-')}`)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ArchiveView = ({ 
  allMinifigs, 
  onToggleOwned, 
  faction, 
  data, 
  title, 
  subtitle, 
  desc, 
  themeColor,
  seo 
}: { 
  allMinifigs: Minifigure[], 
  onToggleOwned: (id: string) => void, 
  faction: string,
  data: EliteSection[],
  title: string,
  subtitle: string,
  desc: string,
  themeColor: string,
  seo: any
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const getFigs = (ids: string[]) => 
    allMinifigs
      .filter(m => ids.includes(m.item_no))
      .sort((a, b) => a.item_no.localeCompare(b.item_no));

  return (
    <div className="py-16 px-6 bg-slate-950 relative overflow-hidden min-h-screen">
      <SEO {...seo} />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-${themeColor}-500/10 border border-${themeColor}-500/20 mb-6`}
          >
            <span className={`w-2 h-2 bg-${themeColor}-500 rounded-full`}></span>
            <span className={`text-[10px] font-black uppercase tracking-widest text-${themeColor}-300`}>{subtitle}</span>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none mb-6">
            {title}
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-3xl">
            {desc}
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="sticky top-0 z-[100] bg-slate-950/80 backdrop-blur-md -mx-6 px-6 py-4 border-b border-white/5 mb-12 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max">
            {data.map((section, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === idx 
                    ? `bg-${themeColor}-600 text-white shadow-lg shadow-${themeColor}-600/20` 
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {section.name}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-24"
          >
            <section>
              <div className="mb-12">
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tight mb-2">{data[activeTab].name}</h2>
                <p className="text-slate-500 text-sm">{data[activeTab].desc}</p>
              </div>

              <div className="space-y-16">
                {data[activeTab].subsections.map((sub, subIdx) => (
                  <div key={subIdx} className="bg-white/5 rounded-[2.5rem] p-8 md:p-12 border border-white/5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                      <h3 className={`text-xl font-black text-white uppercase italic tracking-tight flex items-center gap-3`}>
                        <span className={`w-8 h-px bg-${themeColor}-500`}></span>
                        {sub.name}
                      </h3>
                      <Link 
                        to={`${sub.id}`}
                        className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl bg-${themeColor}-500/10 text-${themeColor}-400 border border-${themeColor}-500/20 hover:bg-${themeColor}-500 hover:text-white transition-all text-center`}
                      >
                        Explore Detailed Archive →
                      </Link>
                    </div>

                    {sub.desc && (
                      <p className={`text-slate-500 text-xs leading-relaxed mb-8 max-w-2xl border-l-2 border-${themeColor}-500/30 pl-4`}>
                        {sub.desc}
                      </p>
                    )}
                    
                    <div className="space-y-12">
                      {sub.items.map((item, iIdx) => {
                        const figs = getFigs(item.ids);
                        if (figs.length === 0) return null;
                        return (
                          <div key={iIdx}>
                            <div className="mb-6">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                {item.label}
                                <span className="text-slate-600">({figs.length})</span>
                              </h4>
                              {item.desc && <p className="text-slate-500 text-[10px] leading-relaxed max-w-xl">{item.desc}</p>}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                              {figs.slice(0, 6).map(m => (
                                <MinifigCard 
                                  key={m.item_no} 
                                  minifig={m} 
                                  variant="dark"
                                  onToggleOwned={onToggleOwned}
                                  onClick={() => navigate(`/minifigs/${m.item_no}-${m.name.toLowerCase().replace(/ /g, '-')}`)}
                                />
                              ))}
                              {figs.length > 6 && (
                                <Link 
                                  to={`${sub.id}`}
                                  className="aspect-[3/4] rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-2 group hover:bg-white/10 transition-all"
                                >
                                  <div className={`w-10 h-10 rounded-full bg-${themeColor}-500/20 flex items-center justify-center text-${themeColor}-400 group-hover:scale-110 transition-transform`}>
                                    <i className="fas fa-plus text-xs"></i>
                                  </div>
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">View {figs.length - 6} More</span>
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const EliteSpecialists: React.FC<EliteSpecialistsProps> = ({ allMinifigs, onToggleOwned }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="sticky top-0 z-[110] bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/lego-star-wars-minifigure-archive')} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
              <i className="fas fa-arrow-left"></i> Archive
            </button>
            <span className="text-slate-700">/</span>
            <Link to="/role/elite-specialists" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
              Elite Specialists
            </Link>
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Elite Guide</div>
        </div>
      </nav>

      <Routes>
        <Route index element={<EliteHome allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} />} />
        <Route path="mandalorians" element={
          <ArchiveView 
            allMinifigs={allMinifigs}
            onToggleOwned={onToggleOwned}
            faction="mandalorians"
            data={MANDALORIAN_DATA}
            title="Mandalorians: Master Archive"
            subtitle="This is the Way"
            desc="Welcome to the definitive visual archive of the legendary warriors of Mandalore."
            themeColor="indigo"
            seo={{
              title: "LEGO Mandalorians Master Archive | Elite Guide",
              description: "A comprehensive visual guide to every LEGO Mandalorian variant.",
              keywords: "LEGO Mandalorian, Din Djarin, Boba Fett, Bo-Katan, Death Watch"
            }}
          />
        } />
        <Route path="mandalorians/:subId" element={<EliteSubArchive allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} faction="mandalorians" />} />
        
        <Route path="elite-clones" element={
          <ArchiveView 
            allMinifigs={allMinifigs}
            onToggleOwned={onToggleOwned}
            faction="elite-clones"
            data={ELITE_CLONE_DATA}
            title="Elite Clone Units: Master Archive"
            subtitle="The Best of the Best"
            desc="The Republic's most specialized and highly trained clone troopers."
            themeColor="blue"
            seo={{
              title: "LEGO Elite Clone Units Master Archive | Elite Guide",
              description: "A comprehensive visual guide to every LEGO Elite Clone variant.",
              keywords: "LEGO ARC Trooper, Bad Batch, Clone Commando"
            }}
          />
        } />
        <Route path="elite-clones/:subId" element={<EliteSubArchive allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} faction="elite-clones" />} />

        <Route path="imperial-guards" element={
          <ArchiveView 
            allMinifigs={allMinifigs}
            onToggleOwned={onToggleOwned}
            faction="imperial-guards"
            data={IMPERIAL_GUARD_DATA}
            title="Imperial Guards: Master Archive"
            subtitle="The Emperor's Protectors"
            desc="The elite personal guards of the Emperor and Supreme Leader."
            themeColor="rose"
            seo={{
              title: "LEGO Imperial Guards Master Archive | Elite Guide",
              description: "A comprehensive visual guide to every LEGO Imperial Guard variant.",
              keywords: "LEGO Royal Guard, Praetorian Guard, Shadow Guard"
            }}
          />
        } />
        <Route path="imperial-guards/:subId" element={<EliteSubArchive allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} faction="imperial-guards" />} />
      </Routes>
    </div>
  );
};

const EliteHome = ({ allMinifigs, onToggleOwned }: { allMinifigs: Minifigure[], onToggleOwned: (id: string) => void }) => {
  const navigate = useNavigate();

  const topEliteSpecialists = useMemo(() => {
    return allMinifigs
      .filter(m => 
        m.name.toLowerCase().includes('mandalorian') || 
        m.name.toLowerCase().includes('fett') ||
        m.name.toLowerCase().includes('arc trooper') ||
        m.name.toLowerCase().includes('commando') ||
        m.name.toLowerCase().includes('guard')
      )
      .sort((a, b) => (b.last_stock_min_price || 0) - (a.last_stock_min_price || 0))
      .slice(0, 10);
  }, [allMinifigs]);

  const getFigures = (ids: string[]) => allMinifigs.filter(m => ids.includes(m.item_no)).slice(0, 4);

  const mandoFigures = getFigures(['sw1057', 'sw1135', 'sw1166', 'sw1164']);
  const cloneFigures = getFigures(['sw1148', 'sw1149', 'sw0377', 'sw0378']);
  const guardFigures = getFigures(['sw0040', 'sw0521', 'sw0855', 'sw0604']);

  return (
    <>
      <SEO 
        title="LEGO Star Wars Elite Specialists | The Master Archive"
        description="Explore the definitive visual guide to LEGO Star Wars Elite Specialists, including Mandalorians, Elite Clones, and Imperial Guards."
      />

      <header className="relative pt-16 pb-24 px-6 overflow-hidden bg-slate-950">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] opacity-30"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">The Best of the Best</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-[0.85] mb-8"
          >
            LEGO Star Wars <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-blue-400">Elite Specialists</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            The most skilled warriors in the galaxy. Explore the complete visual history of Mandalorians, Elite Clone Units, and Imperial Guards.
          </motion.p>
          <div className="mt-12 p-8 bg-slate-900/50 rounded-3xl border border-white/5 text-slate-300 text-sm leading-relaxed max-w-3xl mx-auto">
            Elite Specialists, distinct from standard infantry, add depth and professionalism to any diorama. From the unique armor designs of Mandalorians to the distinct appearances of Clone Force 99 (The Bad Batch) and the imposing presence of Imperial Guards, these figures are often produced in smaller quantities, making them highly sought after by collectors. Equipped with specialized weapons and gear, these elite units are essential for a truly professional collection. As these figures are often released in limited sets, strategic collecting is recommended to ensure you don't miss out on these rare additions.
          </div>
        </div>
      </header>

      <section className="py-16 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto space-y-24">
          {/* Mandalorians */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <Link to="mandalorians" className="group block">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🛡️</div>
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter group-hover:text-indigo-400 transition-colors">Mandalorians</h2>
                </div>
              </Link>
              <p className="text-indigo-400 font-bold text-sm uppercase tracking-widest mb-6">"This is the Way"</p>
              <div className="space-y-8">
                <div>
                  <h3 className="text-white text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    Clans & Coverts
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Din Djarin, Boba Fett, Bo-Katan, Death Watch, and Super Commando Legions.
                  </p>
                </div>
                <Link to="mandalorians" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors">
                  Enter Master Archive <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {mandoFigures.map(m => (
                <MinifigCard key={m.item_no} minifig={m} variant="dark" onToggleOwned={onToggleOwned} onClick={() => navigate(`/minifigs/${m.item_no}-${m.name.toLowerCase().replace(/ /g, '-')}`)} />
              ))}
            </div>
          </div>

          {/* Elite Clones */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 lg:order-2">
              <Link to="elite-clones" className="group block">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🎯</div>
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter group-hover:text-blue-400 transition-colors">Elite Clone Units</h2>
                </div>
              </Link>
              <p className="text-blue-400 font-bold text-sm uppercase tracking-widest mb-6">"Special Forces of the Republic"</p>
              <div className="space-y-8">
                <div>
                  <h3 className="text-white text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Advanced Tactics
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    ARC Troopers, Bad Batch (Clone Force 99), and Clone Commandos.
                  </p>
                </div>
                <Link to="elite-clones" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-white transition-colors">
                  Enter Master Archive <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>
            <div className="lg:col-span-7 lg:order-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {cloneFigures.map(m => (
                <MinifigCard key={m.item_no} minifig={m} variant="dark" onToggleOwned={onToggleOwned} onClick={() => navigate(`/minifigs/${m.item_no}-${m.name.toLowerCase().replace(/ /g, '-')}`)} />
              ))}
            </div>
          </div>

          {/* Imperial Guards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <Link to="imperial-guards" className="group block">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-rose-600/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🩸</div>
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter group-hover:text-rose-400 transition-colors">Imperial Guards</h2>
                </div>
              </Link>
              <p className="text-rose-400 font-bold text-sm uppercase tracking-widest mb-6">"The Emperor's Protectors"</p>
              <div className="space-y-8">
                <div>
                  <h3 className="text-white text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                    Royal Escort
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Royal Guard, Praetorian Guard, Shadow Guard, and Senate Guard.
                  </p>
                </div>
                <Link to="imperial-guards" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-white transition-colors">
                  Enter Master Archive <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {guardFigures.map(m => (
                <MinifigCard key={m.item_no} minifig={m} variant="dark" onToggleOwned={onToggleOwned} onClick={() => navigate(`/minifigs/${m.item_no}-${m.name.toLowerCase().replace(/ /g, '-')}`)} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em]">Popular Elite Specialists TOP 10</h2>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {topEliteSpecialists.map((m, idx) => (
              <div key={m.item_no} className="relative">
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] font-black text-white z-10 shadow-lg">
                  {idx + 1}
                </div>
                <MinifigCard minifig={m} variant="dark" onToggleOwned={onToggleOwned} onClick={() => navigate(`/minifigs/${m.item_no}-${m.name.toLowerCase().replace(/ /g, '-')}`)} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default EliteSpecialists;
