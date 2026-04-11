import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useParams, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minifigure } from '../types';
import MinifigCard from '../components/MinifigCard';
import SEO from '../components/SEO';
import { SKYWALKER_SAGA_DATA, JEDI_COUNCIL_DATA, SITH_DARK_SIDE_DATA, CharacterSection } from '../src/constants/characterData';
import { useMinifigLoader, LoaderConfig } from '../hooks/useMinifigLoader';

interface CharacterCenterpiecesProps {
  allMinifigs: Minifigure[];
  onToggleOwned: (id: string) => void;
}

const CharacterSubArchive = ({ allMinifigs, onToggleOwned, faction }: { allMinifigs: Minifigure[], onToggleOwned: (id: string) => void, faction: 'skywalker' | 'jedi' | 'sith' }) => {
  const { subId } = useParams();
  const navigate = useNavigate();

  const data = useMemo(() => {
    if (faction === 'skywalker') return SKYWALKER_SAGA_DATA;
    if (faction === 'jedi') return JEDI_COUNCIL_DATA;
    return SITH_DARK_SIDE_DATA;
  }, [faction]);

  const subSection = useMemo(() => {
    for (const section of data) {
      const found = section.subsections.find(s => s.id === subId);
      if (found) return { section, sub: found };
    }
    return null;
  }, [data, subId]);

  const loaderConfigs = useMemo(() => {
    if (!subSection) return [];
    return subSection.sub.items.map(item => ({ 
      ids: item.ids,
      nameFilter: item.nameFilter,
      excludeFilter: item.excludeFilter
    }));
  }, [subSection]);

  const { combinedMinifigs, isLoading } = useMinifigLoader(allMinifigs, loaderConfigs);

  if (!subSection) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Sub-archive not found</div>;

  const getFigs = (item: { ids?: string[], nameFilter?: string[], excludeFilter?: string[] }) => {
    let figs = combinedMinifigs;
    if (item.nameFilter && item.nameFilter.length > 0) {
      figs = figs.filter(m => item.nameFilter!.some(n => m.name.toLowerCase().includes(n.toLowerCase())));
      if (item.excludeFilter && item.excludeFilter.length > 0) {
        figs = figs.filter(m => !item.excludeFilter!.some(n => m.name.toLowerCase().includes(n.toLowerCase())));
      }
    } else if (item.ids && item.ids.length > 0) {
      figs = figs.filter(m => item.ids!.includes(m.item_no));
    } else {
      return [];
    }
    return figs.sort((a, b) => a.item_no.localeCompare(b.item_no));
  };

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
            <p className="text-slate-400 text-lg leading-relaxed max-w-3xl border-l-4 border-amber-500 pl-6">
              {subSection.sub.desc}
            </p>
          )}
          
          {/* Skywalker Family History Summary */}
          {faction === 'skywalker' && (
            <div className="mt-12 p-8 bg-slate-900/50 rounded-3xl border border-white/5">
              <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-4">Skywalker Family History</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                The Skywalker lineage began with Shmi Skywalker on Tatooine, whose son, Anakin, was prophesied to bring balance to the Force. Anakin's marriage to Padmé Amidala led to the birth of twins, Luke and Leia, who became the hope of the galaxy against the Empire. The legacy continued with Leia's son, Ben Solo, whose journey reflects the eternal struggle between the light and dark sides of the Force that has defined this family for generations.
              </p>
            </div>
          )}
        </header>

        <div className="space-y-16">
          {subSection.sub.items.map((item, iIdx) => {
            const figs = getFigs(item);
            if (figs.length === 0) return null;
            return (
              <div key={iIdx}>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  {item.label}
                  <span className="text-slate-600">({figs.length})</span>
                </h4>
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
  data: CharacterSection[],
  title: string,
  subtitle: string,
  desc: string,
  themeColor: string,
  seo: { title: string; description: string; keywords?: string }
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const loaderConfigs = useMemo(() => {
    const configs: LoaderConfig[] = [];
    data.forEach(section => {
      section.subsections.forEach(sub => {
        sub.items.forEach(item => {
          configs.push({ 
            ids: item.ids,
            nameFilter: item.nameFilter,
            excludeFilter: item.excludeFilter
          });
        });
      });
    });
    return configs;
  }, [data]);

  const { combinedMinifigs } = useMinifigLoader(allMinifigs, loaderConfigs);

  const getFigs = (item: { ids?: string[], nameFilter?: string[], excludeFilter?: string[] }) => {
    let figs = combinedMinifigs;
    if (item.nameFilter && item.nameFilter.length > 0) {
      figs = figs.filter(m => item.nameFilter!.some(n => m.name.toLowerCase().includes(n.toLowerCase())));
      if (item.excludeFilter && item.excludeFilter.length > 0) {
        figs = figs.filter(m => !item.excludeFilter!.some(n => m.name.toLowerCase().includes(n.toLowerCase())));
      }
    } else if (item.ids && item.ids.length > 0) {
      figs = figs.filter(m => item.ids!.includes(m.item_no));
    } else {
      return [];
    }
    return figs.sort((a, b) => a.item_no.localeCompare(b.item_no));
  };

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
                {section.title.split('. ')[1] || section.title}
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
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tight mb-2">{data[activeTab].title}</h2>
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
                        const figs = getFigs(item);
                        if (figs.length === 0) return null;
                        return (
                          <div key={iIdx}>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                              {item.label}
                              <span className="text-slate-600">({figs.length})</span>
                            </h4>
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

const CharacterCenterpieces: React.FC<CharacterCenterpiecesProps> = ({ allMinifigs, onToggleOwned }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30">
      {/* Navigation */}
      <nav className="sticky top-0 z-[110] bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/lego-star-wars-minifigure-archive')} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
              <i className="fas fa-arrow-left"></i> Archive
            </button>
            <span className="text-slate-700">/</span>
            <Link to="/lego-star-wars-minifigure-archive/character-centerpieces" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
              Character Centerpieces
            </Link>
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Character Guide</div>
        </div>
      </nav>

      <Routes>
        <Route index element={<CharacterHome allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} />} />
        <Route path="skywalker" element={
          <ArchiveView 
            allMinifigs={allMinifigs}
            onToggleOwned={onToggleOwned}
            faction="skywalker"
            data={SKYWALKER_SAGA_DATA}
            title="The Skywalker Saga: Master Archive"
            subtitle="The Chosen One's Legacy"
            desc="Welcome to the definitive visual archive of the Skywalker family. From Anakin's fall to Luke's rise, these figures are the centerpiece of any collection."
            themeColor="amber"
            seo={{
              title: "LEGO Skywalker Master Archive | Character Guide",
              description: "A comprehensive visual guide to every LEGO Skywalker variant.",
              keywords: "LEGO Skywalker, Anakin Skywalker, Luke Skywalker, Darth Vader, LEGO Star Wars Characters"
            }}
          />
        } />
        <Route path="skywalker/:subId" element={<CharacterSubArchive allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} faction="skywalker" />} />
        
        <Route path="jedi" element={
          <ArchiveView 
            allMinifigs={allMinifigs}
            onToggleOwned={onToggleOwned}
            faction="jedi"
            data={JEDI_COUNCIL_DATA}
            title="Jedi Council: Master Archive"
            subtitle="Guardians of Peace and Justice"
            desc="The wisest and most powerful Jedi Masters who led the Jedi Order during its final days."
            themeColor="emerald"
            seo={{
              title: "LEGO Jedi Council Master Archive | Character Guide",
              description: "A comprehensive visual guide to every LEGO Jedi Council variant.",
              keywords: "LEGO Jedi, Obi-Wan Kenobi, Master Yoda, Mace Windu, Qui-Gon Jinn, Ahsoka Tano"
            }}
          />
        } />
        <Route path="jedi/:subId" element={<CharacterSubArchive allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} faction="jedi" />} />

        <Route path="sith" element={
          <ArchiveView 
            allMinifigs={allMinifigs}
            onToggleOwned={onToggleOwned}
            faction="sith"
            data={SITH_DARK_SIDE_DATA}
            title="Sith & Dark Side: Master Archive"
            subtitle="Lords of the Sith"
            desc="The dark side users who sought to control the galaxy."
            themeColor="rose"
            seo={{
              title: "LEGO Sith Master Archive | Character Guide",
              description: "A comprehensive visual guide to every LEGO Sith variant.",
              keywords: "LEGO Sith, Emperor Palpatine, Darth Maul, Count Dooku, Inquisitorius"
            }}
          />
        } />
        <Route path="sith/:subId" element={<CharacterSubArchive allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} faction="sith" />} />
      </Routes>
    </div>
  );
};

const CharacterHome = ({ allMinifigs, onToggleOwned }: { allMinifigs: Minifigure[], onToggleOwned: (id: string) => void }) => {
  const navigate = useNavigate();

  const loaderConfigs = useMemo(() => [
    { nameFilter: ['Luke Skywalker'] },
    { nameFilter: ['Darth Vader'] },
    { nameFilter: ['Yoda'] },
    { nameFilter: ['Obi-Wan Kenobi'] },
    { nameFilter: ['Palpatine'] },
    { nameFilter: ['Darth Maul'] }
  ], []);

  const { combinedMinifigs } = useMinifigLoader(allMinifigs, loaderConfigs);

  const topCharacterCenterpieces = useMemo(() => {
    return combinedMinifigs
      .filter(m => 
        m.name.toLowerCase().includes('skywalker') || 
        m.name.toLowerCase().includes('jedi') ||
        m.name.toLowerCase().includes('sith') ||
        m.name.toLowerCase().includes('vader') ||
        m.name.toLowerCase().includes('yoda') ||
        m.name.toLowerCase().includes('maul')
      )
      .sort((a, b) => (b.last_price || 0) - (a.last_price || 0))
      .slice(0, 10);
  }, [combinedMinifigs]);

  const getFigures = (ids: string[]) => combinedMinifigs.filter(m => ids.includes(m.item_no)).slice(0, 4);

  const skywalkerFigures = getFigures(['sw0004', 'sw0019', 'sw0021', 'sw0277']);
  const jediFigures = getFigures(['sw0023', 'sw0446', 'sw0479', 'sw0198']);
  const sithFigures = getFigures(['sw0003', 'sw0041', 'sw0060', 'sw0218']);

  return (
    <>
      <SEO 
        title="LEGO Star Wars Character Centerpieces | The Master Archive"
        description="Explore the definitive visual guide to LEGO Star Wars Character Centerpieces, including the Skywalker Saga, Jedi Council, and Sith Lords."
      />

      <header className="relative pt-16 pb-24 px-6 overflow-hidden bg-slate-950">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/20 rounded-full blur-[120px] opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-600/10 rounded-full blur-[100px] opacity-30"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">Legends of the Galaxy</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-[0.85] mb-8"
          >
            LEGO Star Wars <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-rose-400">Character Centerpieces</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            The iconic heroes and villains that shaped the galaxy. Explore the evolution of key characters from the Skywalker Saga, the Jedi Council, and the Sith Lords.
          </motion.p>
          <div className="mt-12 p-8 bg-slate-900/50 rounded-3xl border border-white/5 text-slate-300 text-sm leading-relaxed max-w-3xl mx-auto">
            The heart of Star Wars lies in its characters. LEGO Star Wars Character Centerpieces are more than just minifigures; they are the protagonists that bring iconic movie scenes to life. Key figures like Anakin Skywalker, Luke, and Darth Vader vary in detail, printing, and part composition across different versions, making them highly valuable to collectors. Modern versions, featuring intricate arm and leg printing, showcase the pinnacle of LEGO design. Placing these iconic characters at the center of your collection will truly complete your Star Wars legacy.
          </div>
        </div>
      </header>

      <section className="py-16 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto space-y-24">
          {/* Skywalker Saga */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <Link to="skywalker" className="group block">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-amber-600/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">☀️</div>
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter group-hover:text-amber-400 transition-colors">Skywalker Saga</h2>
                </div>
              </Link>
              <p className="text-amber-400 font-bold text-sm uppercase tracking-widest mb-6">"The Chosen One and his legacy"</p>
              <div className="space-y-8">
                <div>
                  <h3 className="text-white text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                    Key Figures
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Anakin Skywalker, Luke Skywalker, and Darth Vader through the ages.
                  </p>
                </div>
                <Link to="skywalker" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-400 hover:text-white transition-colors">
                  Enter Master Archive <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {skywalkerFigures.map(m => (
                <MinifigCard key={m.item_no} minifig={m} variant="dark" onToggleOwned={onToggleOwned} onClick={() => navigate(`/minifigs/${m.item_no}-${m.name.toLowerCase().replace(/ /g, '-')}`)} />
              ))}
            </div>
          </div>

          {/* Jedi Council */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 lg:order-2">
              <Link to="jedi" className="group block">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">⚔️</div>
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter group-hover:text-emerald-400 transition-colors">Jedi Council</h2>
                </div>
              </Link>
              <p className="text-emerald-400 font-bold text-sm uppercase tracking-widest mb-6">"Guardians of peace and justice"</p>
              <div className="space-y-8">
                <div>
                  <h3 className="text-white text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    Masters & Knights
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Obi-Wan Kenobi, Yoda, Mace Windu, Ahsoka Tano, and other legendary Jedi.
                  </p>
                </div>
                <Link to="jedi" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-white transition-colors">
                  Enter Master Archive <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>
            <div className="lg:col-span-7 lg:order-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {jediFigures.map(m => (
                <MinifigCard key={m.item_no} minifig={m} variant="dark" onToggleOwned={onToggleOwned} onClick={() => navigate(`/minifigs/${m.item_no}-${m.name.toLowerCase().replace(/ /g, '-')}`)} />
              ))}
            </div>
          </div>

          {/* Sith & Dark Side */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <Link to="sith" className="group block">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-rose-600/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">⚡</div>
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter group-hover:text-rose-400 transition-colors">Sith & Dark Side</h2>
                </div>
              </Link>
              <p className="text-rose-400 font-bold text-sm uppercase tracking-widest mb-6">"The power of the dark side"</p>
              <div className="space-y-8">
                <div>
                  <h3 className="text-white text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                    Dark Lords
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Emperor Palpatine, Darth Maul, Count Dooku, and the deadly Inquisitors.
                  </p>
                </div>
                <Link to="sith" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-white transition-colors">
                  Enter Master Archive <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {sithFigures.map(m => (
                <MinifigCard key={m.item_no} minifig={m} variant="dark" onToggleOwned={onToggleOwned} onClick={() => navigate(`/minifigs/${m.item_no}-${m.name.toLowerCase().replace(/ /g, '-')}`)} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-xs font-black text-amber-500 uppercase tracking-[0.3em]">Popular Centerpieces TOP 10</h2>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {topCharacterCenterpieces.map((m, idx) => (
              <div key={m.item_no} className="relative">
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-[10px] font-black text-white z-10 shadow-lg">
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

export default CharacterCenterpieces;
