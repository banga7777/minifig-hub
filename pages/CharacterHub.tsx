import React, { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Target, 
  Users, 
  History, 
  ChevronRight, 
  Info, 
  FileText, 
  Database,
  Search,
  ArrowLeft,
  Skull,
  Flame,
  Zap,
  Crosshair,
  Wind,
  Layers,
  GitBranch,
  Award,
  Compass,
  LayoutGrid,
  TrendingUp,
  Scale
} from 'lucide-react';
import { Minifigure } from '../types';
import { updateMetaTags } from '../utils/seo';

interface CharacterHubProps {
  allMinifigs: Minifigure[];
  onToggleOwned: (id: string) => void;
}

const CharacterHub: React.FC<CharacterHubProps> = ({ allMinifigs, onToggleOwned }) => {
  const navigate = useNavigate();

  // SEO Meta Tags
  useEffect(() => {
    updateMetaTags(
      "2026 레고 트루퍼 수집 가이드: 501군단부터 아미 빌딩 전략까지 | Minifig Hub",
      "2026년 최신 레고 트루퍼 수집의 권위자가 전하는 아미 빌딩 가이드. 입문자용 501군단부터 최신 2026년형 듀얼 몰딩 트루퍼까지, 완벽한 군단 편성 전략을 확인하세요.",
      "/character/troopers"
    );
  }, []);

  const lastUpdated = "2026.02.25";

  const trooperStats = useMemo(() => {
    const troopers = allMinifigs.filter(m => 
      m.name.toLowerCase().includes('trooper') || 
      m.name.toLowerCase().includes('stormtrooper') ||
      m.name.toLowerCase().includes('clonetrooper')
    );
    return {
      total: troopers.length,
      owned: troopers.filter(m => m.owned).length
    };
  }, [allMinifigs]);

  const navRailItems = [
    { id: 'imperial-stormtrooper', name: 'Imperial Stormtrooper', img: 'sw0585', desc: 'The iconic backbone of the Empire.', link: '/character/troopers/imperial-stormtrooper' },
    { id: 'clone-trooper', name: 'Clone Trooper', img: 'sw1233', desc: 'The genetically engineered Republic force.', link: '/character/troopers/clone-trooper' },
    { id: 'snowtrooper', name: 'Snowtrooper', img: 'sw1162', desc: 'Cold-weather specialists from Hoth.', link: '/character/troopers/imperial-stormtrooper/snowtrooper' },
    { id: 'scout-trooper', name: 'Scout Trooper', img: 'sw1003', desc: 'Lightweight recon and sniper units.', link: '/character/troopers/imperial-stormtrooper/scout-trooper' },
    { id: 'death-trooper', name: 'Death Trooper', img: 'sw0807', desc: 'Elite Imperial Intelligence guards.', link: '/character/troopers/imperial-stormtrooper/death-trooper' },
    { id: 'first-order-stormtrooper', name: 'First Order Stormtrooper', img: 'sw0667', desc: 'The sleek evolution of the sequel era.', link: '/character/troopers/first-order-stormtrooper' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans selection:bg-indigo-100">
      {/* 1) HERO SECTION */}
      <div className="bg-[#0f172a] pt-20 pb-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-8">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={10} />
            <span className="text-white">Characters</span>
            <ChevronRight size={10} />
            <span className="text-indigo-500">Trooper Hub</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.85] mb-8 text-white">
            LEGO TROOPER<br />
            <span className="text-indigo-500">MINIFIGURE HUB</span>
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-slate-400 mb-8">
            <p className="text-xl md:text-2xl max-w-2xl font-medium leading-relaxed italic">
              The definitive authority on the galaxy's most collected army-building icons, from the 1999 classics to modern dual-molded masterpieces.
            </p>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Last Updated: {lastUpdated}</span>
            </div>
          </div>

          {/* Table of Contents (TOC) for SEO & UX */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md max-w-3xl">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-4 flex items-center gap-2">
              <LayoutGrid size={12} /> Quick Navigation
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Architecture', id: 'architecture' },
                { name: 'Factions', id: 'factions' },
                { name: 'Evolution', id: 'evolution' },
                { name: 'Decision Guide', id: 'decision-guide' },
              ].map(link => (
                <a 
                  key={link.id} 
                  href={`#${link.id}`} 
                  className="text-xs font-bold text-slate-300 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <ChevronRight size={10} className="text-indigo-500 group-hover:translate-x-1 transition-transform" />
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2) ENTITY IDENTITY BLOCK */}
      <div className="max-w-6xl mx-auto px-6 -mt-16 relative z-30">
        <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-8 md:p-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {[
            { label: 'Category', val: 'LEGO Troopers', icon: <Users size={14} /> },
            { label: 'Universe', val: 'Star Wars', icon: <Compass size={14} /> },
            { label: 'Core Purpose', val: 'Army Building', icon: <LayoutGrid size={14} /> },
            { label: 'Appearance', val: '1999', icon: <History size={14} /> },
            { label: 'Status', val: 'Elite Category', icon: <Award size={14} /> },
            { label: 'Variants', val: `${trooperStats.total}+`, icon: <Database size={14} /> },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                {item.icon}
                {item.label}
              </div>
              <p className="text-sm font-black text-slate-900 uppercase">{item.val}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-20" id="architecture">
        {/* 3) LONG INTRO (MANDATORY) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-32">
          <div className="lg:col-span-8 space-y-8">
            <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight">The Architecture of LEGO Army Building (1999-2026)</h2>
            <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed">
              <p>
                As of early 2026, LEGO Trooper minifigures remain the single most influential category in the LEGO Star Wars ecosystem. Since their debut in the 1999 7141 Naboo Fighter set, these faceless soldiers have transcended their role as play-set accessories to become the primary currency of the "Army Building" culture. To a modern collector, the subtle curve of a helmet mold or the inclusion of dual-molded legs—now standard in many 2025-2026 releases—represents a specific era of LEGO design philosophy.
              </p>
              <p>
                The culture of <strong>Army Building</strong> has reached new heights in 2026. Unlike hero characters like Luke Skywalker, where a collector might only desire one definitive version, Troopers are designed to be amassed. This drive to create massive formations—whether it's a battalion of <Link to="/character/troopers/clone-trooper/phase-2-clone" className="text-indigo-600 font-bold hover:underline">Phase II Clone Troopers</Link> or a legion of <Link to="/character/troopers/first-order-stormtrooper" className="text-indigo-600 font-bold hover:underline">First Order Stormtroopers</Link>—has turned the Trooper market into a sophisticated economy. In 2026, collectors analyze "price-per-grunt" metrics and hunt for bulk lots to achieve a sense of scale and military precision that few other themes can match.
              </p>
              <p>
                Factional differences further deepen the collecting experience. The <strong>Galactic Republic</strong> era focuses on individuality within uniformity, with Clone Legions like the <Link to="/character/troopers/clone-trooper/501st-legion" className="text-indigo-600 font-bold hover:underline">501st</Link> or <Link to="/character/troopers/clone-trooper/212th-battalion" className="text-indigo-600 font-bold hover:underline">212th</Link> offering color-coded variety. In contrast, the <strong>Galactic Empire</strong> emphasizes stark, terrifying uniformity, where every Stormtrooper is a nameless cog in a galactic machine. The <strong>First Order</strong> represents the modern evolution, with sleek, "Apple-esque" redesigns that reflect a more futuristic, integrated aesthetic.
              </p>
              <p>
                Design evolution is the pulse of this hub. We have moved from the "yellow-head" era of the early 2000s, through the "Clone Wars" stylized faces, to the modern 2026 era of hyper-realistic printing and dual-molded helmets. Each step in this evolution impacts collector value and display harmony. This hub serves as your definitive authority, tracking these changes and providing the strategic insights needed to navigate the complex world of LEGO Trooper collecting in 2026.
              </p>
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="bg-indigo-600 rounded-[2rem] p-8 text-white space-y-6 sticky top-24">
              <Zap size={32} className="text-indigo-300" />
              <h3 className="text-2xl font-black uppercase italic leading-none">Collector<br />Authority Note</h3>
              <p className="text-indigo-100 text-sm leading-relaxed">
                "A true army builder doesn't just collect figures; they collect formations. The value of a trooper is multiplied by the strength of its squad."
              </p>
              <div className="pt-4 border-t border-indigo-500">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Current Market Trend</p>
                <p className="text-lg font-bold">Legion-Specific Demand ↑</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4) TROOPER TYPES NAVIGATION RAIL */}
        <div className="mb-32">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Trooper Entity Rail</h2>
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400">
                <ArrowLeft size={14} />
              </div>
              <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-900">
                <ChevronRight size={14} />
              </div>
            </div>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar snap-x">
            {navRailItems.map((item) => {
              const fig = allMinifigs.find(m => m.item_no === item.img);
              return (
                <Link 
                  key={item.id}
                  to={item.link}
                  className="min-w-[280px] bg-white border border-slate-100 rounded-3xl p-6 snap-start hover:shadow-xl hover:-translate-y-1 transition-all group"
                >
                  <div className="aspect-square bg-slate-50 rounded-2xl mb-6 flex items-center justify-center overflow-hidden">
                    <img 
                      src={fig?.image_url} 
                      alt={`LEGO ${item.name} Minifigure - ${fig?.item_no || ''}`} 
                      loading="lazy"
                      className="w-32 h-32 object-contain group-hover:scale-110 transition-transform" 
                    />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">{item.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">{item.desc}</p>
                  <div className="flex items-center gap-1 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                    View Entity <ChevronRight size={12} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 5) FACTION-BASED CLASSIFICATION (CRITICAL) */}
        <div className="space-y-32 mb-32" id="factions">
          {/* REPUBLIC SECTION */}
          <section id="republic" className="relative">
            <div className="bg-indigo-50/50 rounded-[3rem] p-8 md:p-16 border border-indigo-100">
              <div className="flex items-center gap-4 mb-12">
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Shield size={32} className="text-white" />
                </div>
                <div>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase italic tracking-tighter">Galactic Republic Troopers</h2>
                  <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs mt-1">Tactical Military UI // Legion Identity</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { name: 'Phase I', img: 'sw0058', link: '/character/troopers/clone-trooper/phase-1-clone' },
                  { name: 'Phase II', img: 'sw1233', link: '/character/troopers/clone-trooper/phase-2-clone' },
                  { name: '501st Legion', img: 'sw1094', link: '/character/troopers/clone-trooper/501st-legion' },
                  { name: '212th Battalion', img: 'sw1235', link: '/character/troopers/clone-trooper/212th-battalion' },
                  { name: 'Shock Trooper', img: 'sw0531', link: '/character/troopers/clone-trooper/shock-trooper' },
                  { name: 'ARF / Airborne', img: 'sw0297', link: '/character/troopers/clone-trooper/arf-trooper' },
                ].map(unit => {
                  const fig = allMinifigs.find(m => m.item_no === unit.img);
                  return (
                    <Link key={unit.name} to={unit.link} className="bg-white p-4 rounded-3xl border border-indigo-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col items-center text-center">
                      <div className="w-16 h-16 mb-3 flex items-center justify-center bg-slate-50 rounded-2xl overflow-hidden">
                        <img 
                          src={fig?.image_url} 
                          alt={`LEGO ${unit.name} Clone Trooper Minifigure - ${fig?.item_no || ''}`} 
                          loading="lazy"
                          className="w-12 h-12 object-contain group-hover:scale-110 transition-transform" 
                        />
                      </div>
                      <h3 className="text-[10px] font-black text-slate-900 uppercase leading-tight">{unit.name}</h3>
                    </Link>
                  );
                })}
              </div>

              <div className="bg-white/60 rounded-3xl border border-indigo-100 overflow-hidden">
                <div className="flex flex-col md:flex-row items-stretch">
                  <div className="bg-indigo-600 p-6 flex flex-col items-center justify-center text-white md:w-48 shrink-0">
                    <Info size={24} className="mb-2" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-center">Collector<br/>Authority</h4>
                  </div>
                  <div className="p-6 flex-grow">
                    <h5 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-2">Republic Doctrine</h5>
                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      Republic Trooper collecting is defined by "Legion Identity." While clones share a genetic root, LEGO gives them unique character through battalion-specific markings. Collectors focus on completing historical squads like the 501st or 212th. The transition from Phase I to Phase II armor represents a major era-shift, showcasing the rapid evolution of LEGO's printing and molding technology.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* EMPIRE SECTION */}
          <section id="empire" className="relative">
            <div className="bg-slate-900 rounded-[3rem] p-8 md:p-16 border border-slate-800 text-white">
              <div className="flex items-center gap-4 mb-12">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                  <Skull size={32} className="text-slate-900" />
                </div>
                <div>
                  <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter">Galactic Empire Troopers</h2>
                  <p className="text-rose-500 font-bold uppercase tracking-widest text-xs mt-1">Command Console UI // Strict Uniformity</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                {[
                  { name: 'Stormtrooper', img: 'sw0585', link: '/character/troopers/imperial-stormtrooper' },
                  { name: 'Sandtrooper', img: 'sw0364', link: '/character/troopers/imperial-stormtrooper' },
                  { name: 'Snowtrooper', img: 'sw1162', link: '/character/troopers/imperial-stormtrooper/snowtrooper' },
                  { name: 'Scout Trooper', img: 'sw1003', link: '/character/troopers/imperial-stormtrooper/scout-trooper' },
                  { name: 'Death Trooper', img: 'sw0807', link: '/character/troopers/imperial-stormtrooper/death-trooper' },
                  { name: 'Shadow Trooper', img: 'sw0166', link: '/character/troopers/imperial-stormtrooper/shadow-trooper' },
                  { name: 'Shore Trooper', img: 'sw0787', link: '/character/troopers/imperial-stormtrooper/shoretrooper' },
                  { name: 'Range Trooper', img: 'sw0950', link: '/character/troopers/imperial-stormtrooper/range-trooper' }
                ].map(unit => {
                  const fig = allMinifigs.find(m => m.item_no === unit.img);
                  return (
                    <Link key={unit.name} to={unit.link} className="bg-slate-800 p-4 rounded-3xl border border-slate-700 hover:border-rose-500 transition-all group flex flex-col items-center text-center">
                      <div className="w-14 h-14 mb-3 flex items-center justify-center bg-slate-700 rounded-2xl overflow-hidden">
                        <img 
                          src={fig?.image_url} 
                          alt={`LEGO ${unit.name} Imperial Stormtrooper Minifigure - ${fig?.item_no || ''}`} 
                          loading="lazy"
                          className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" 
                        />
                      </div>
                      <h3 className="text-[9px] font-black uppercase tracking-tight">{unit.name}</h3>
                    </Link>
                  );
                })}
              </div>

              <div className="bg-slate-800/50 rounded-3xl border border-slate-700 overflow-hidden">
                <div className="flex flex-col md:flex-row items-stretch">
                  <div className="bg-rose-600 p-6 flex flex-col items-center justify-center text-white md:w-48 shrink-0">
                    <Info size={24} className="mb-2" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-center">Collector<br/>Authority</h4>
                  </div>
                  <div className="p-6 flex-grow">
                    <h5 className="text-[11px] font-black text-rose-500 uppercase tracking-widest mb-2">Imperial Doctrine</h5>
                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      Imperial collection is built on "Overwhelming Uniformity." The goal is mass-building grunts to create geometric formations and symmetrical displays. Imperial collecting is the purest form of army building, focusing on the iconic black-and-white silhouette across various environmental specialists like Snowtroopers or Scout Troopers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FIRST ORDER SECTION */}
          <section id="first-order" className="relative">
            <div className="bg-slate-100 rounded-[3rem] p-8 md:p-16 border border-slate-200">
              <div className="flex items-center gap-4 mb-12">
                <div className="w-16 h-16 bg-rose-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Flame size={32} className="text-white" />
                </div>
                <div>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase italic tracking-tighter">First Order Troopers</h2>
                  <p className="text-rose-600 font-bold uppercase tracking-widest text-xs mt-1">Modern Dark UI // Sleek Aesthetic</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {[
                  { name: 'Stormtrooper', img: 'sw0667', link: '/character/troopers/first-order-stormtrooper' },
                  { name: 'Executioner', img: 'sw0844', link: '/character/troopers/first-order-stormtrooper/executioner-trooper' },
                  { name: 'Flametrooper', img: 'sw0666', link: '/character/troopers/first-order-stormtrooper/flametrooper' },
                  { name: 'Riot Control', img: 'sw0671', link: '/character/troopers/first-order-stormtrooper/riot-control-trooper' },
                  { name: 'Sith Trooper', img: 'sw1065', link: '/character/troopers/first-order-stormtrooper/sith-trooper' },
                ].map(unit => {
                  const fig = allMinifigs.find(m => m.item_no === unit.img);
                  return (
                    <Link key={unit.name} to={unit.link} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col items-center text-center">
                      <div className="w-14 h-14 mb-3 flex items-center justify-center bg-slate-50 rounded-2xl overflow-hidden">
                        <img 
                          src={fig?.image_url} 
                          alt={`LEGO ${unit.name} First Order Stormtrooper Minifigure - ${fig?.item_no || ''}`} 
                          loading="lazy"
                          className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" 
                        />
                      </div>
                      <h3 className="text-[9px] font-black text-slate-900 uppercase leading-tight">{unit.name}</h3>
                    </Link>
                  );
                })}
              </div>

              <div className="bg-slate-900 rounded-3xl overflow-hidden border border-white/5">
                <div className="flex flex-col md:flex-row items-stretch">
                  <div className="bg-white p-6 flex flex-col items-center justify-center text-slate-900 md:w-48 shrink-0">
                    <Info size={24} className="mb-2" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-center">Collector<br/>Authority</h4>
                  </div>
                  <div className="p-6 flex-grow">
                    <h5 className="text-[11px] font-black text-rose-500 uppercase tracking-widest mb-2">First Order Doctrine</h5>
                    <p className="text-xs text-slate-400 leading-relaxed italic">
                      First Order collecting highlights "Modern Manufacturing Excellence." These figures feature some of the crispest printing and most integrated mold designs in LEGO history. The aesthetic is futuristic and sleek, appealing to collectors who appreciate the technical evolution of the Star Wars military.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* 6) VISUAL EVOLUTION MAP */}
        <div className="mb-32" id="evolution">
          <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight mb-12 text-center">LEGO Trooper Visual Evolution Map (1999-2026)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Republic Clones', 
                stages: ['Phase I (2002)', 'Phase II (2005)', 'Modern (2020-2026)'],
                focus: 'Helmet Mold Evolution',
                impact: 'Legion accuracy and 360° printing.'
              },
              { 
                title: 'Imperial Stormtroopers', 
                stages: ['Classic (1999)', 'Rebels Style (2014)', 'Dual-Molded (2019-2026)'],
                focus: 'Visor & Vent Detail',
                impact: 'Shift from play-focus to display-accuracy.'
              },
              { 
                title: 'First Order Design', 
                stages: ['TFA (2015)', 'TLJ (2017)', 'Modern Sleek (2026)'],
                focus: 'Integrated Sleekness',
                impact: 'Consistency in modern sequel displays.'
              },
            ].map(evo => (
              <div key={evo.title} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl">
                <h3 className="text-xl font-black text-slate-900 uppercase italic mb-6">{evo.title}</h3>
                <div className="space-y-4 mb-8">
                  {evo.stages.map((stage, i) => (
                    <div key={stage} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-600">
                        {i + 1}
                      </div>
                      <p className="text-sm font-bold text-slate-700">{stage}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t border-slate-100 space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Focus</p>
                  <p className="text-sm font-bold text-slate-900">{evo.focus}</p>
                  <p className="text-xs text-slate-500 leading-relaxed mt-2">{evo.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7) TROOPER HIERARCHY MAP */}
        <div className="mb-32 bg-slate-900 rounded-[3rem] p-8 md:p-16 text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-black uppercase italic tracking-tight mb-16 text-center">Trooper Hierarchy Map</h2>
            <div className="flex flex-col items-center">
              {/* Root */}
              <div className="px-8 py-4 bg-indigo-600 rounded-xl font-black uppercase tracking-widest mb-12 shadow-2xl">
                Faction Command
              </div>
              
              <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                {/* Vertical Lines (simplified for CSS) */}
                <div className="hidden md:block absolute top-[-3rem] left-1/2 w-[1px] h-12 bg-indigo-500/50"></div>
                <div className="hidden md:block absolute top-[-3rem] left-[16.6%] right-[16.6%] h-[1px] bg-indigo-500/50"></div>
                
                {[
                  { title: 'Core Infantry', units: ['Standard Grunt', 'Squad Leader', 'Heavy Weaponry'] },
                  { title: 'Specialized Units', units: ['Environmental (Snow/Sand)', 'Recon (Scout/ARF)', 'Pilot / Support'] },
                  { title: 'Elite Variants', units: ['Commanders / Captains', 'Special Forces (Death/Shadow)', 'Honor Guards'] },
                ].map((tier) => (
                  <div key={tier.title} className="flex flex-col items-center space-y-4">
                    <div className="px-6 py-3 bg-slate-800 border border-slate-700 rounded-lg text-xs font-black uppercase tracking-widest text-indigo-400">
                      {tier.title}
                    </div>
                    <div className="w-[1px] h-8 bg-slate-700"></div>
                    <div className="space-y-2 w-full">
                      {tier.units.map(u => (
                        <div key={u} className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-[10px] font-bold text-slate-400 text-center uppercase tracking-tight">
                          {u}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 8) ARMY BUILDER ECOSYSTEM */}
        <div className="mb-32 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-xl space-y-8">
            <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Army Builder Ecosystem</h2>
            <div className="space-y-8">
              {[
                { 
                  title: 'Squad Formation', 
                  val: '5-10 Figures', 
                  desc: 'Ideal for small dioramas and desk displays. Focus on one leader and a handful of specialized grunts to create a focused narrative scene. This scale is perfect for beginners who want to experience the joy of army building without a massive financial commitment, allowing for high-quality display in limited spaces.' 
                },
                { 
                  title: 'Platoon Scale', 
                  val: '20-40 Figures', 
                  desc: 'The "sweet spot" for shelf displays. Requires tiered stands to ensure every helmet is visible. At this scale, the collective visual impact of the armor becomes the primary focus. It allows for a diverse mix of specialized units (medics, snipers, heavy gunners) while maintaining a cohesive faction identity that commands attention in any room.' 
                },
                { 
                  title: 'Legion Scale', 
                  val: '100+ Figures', 
                  desc: 'For dedicated collectors. Focus on uniformity and mass impact. This scale transforms a collection into a museum-grade installation. It requires significant space and a strategic approach to sourcing figures in bulk. The goal here is "Overwhelming Force"—a sea of identical helmets that replicates the scale of the Star Wars cinematic universe.' 
                },
              ].map(eco => (
                <div key={eco.title} className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-indigo-600 shrink-0">
                    <LayoutGrid size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase">{eco.title}</h3>
                    <p className="text-indigo-600 font-bold text-xs mb-1">{eco.val}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{eco.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-indigo-900 rounded-[3rem] p-8 md:p-12 text-white shadow-xl space-y-8">
            <h2 className="text-2xl font-black uppercase italic tracking-tight">Formation Strategy</h2>
            <div className="space-y-6">
              <div className="p-6 bg-indigo-800/50 rounded-2xl border border-indigo-700">
                <h3 className="text-xs font-black uppercase mb-2 text-indigo-300">Variant Mixing Advice</h3>
                <p className="text-sm leading-relaxed text-indigo-100">
                  Avoid mixing eras (e.g., 1999 Stormtroopers with 2026 versions) in the same front-line formation. The stark difference in printing resolution and plastic sheen can break the immersion. Instead, use older, "classic" variants in the back rows to create depth and a sense of history without compromising the visual harmony of your primary vanguard.
                </p>
              </div>
              <div className="p-6 bg-indigo-800/50 rounded-2xl border border-indigo-700">
                <h3 className="text-xs font-black uppercase mb-2 text-indigo-300">Display Scale & Depth</h3>
                <p className="text-sm leading-relaxed text-indigo-100">
                  For large armies, use <strong>Grey Baseplates</strong> to anchor the formation and provide a neutral, industrial foundation. Tiered acrylic stands are essential for ensuring every helmet is visible in a dense legion. By elevating rear rows, you create a "stadium effect" that maximizes the visibility of your investment and enhances the overall sense of military discipline.
                </p>
              </div>
              <div className="p-6 bg-indigo-800/50 rounded-2xl border border-indigo-700">
                <h3 className="text-xs font-black uppercase mb-2 text-indigo-300">Lighting Strategy</h3>
                <p className="text-sm leading-relaxed text-indigo-100">
                  Directional top-down lighting is the secret to making white armor "pop." It creates sharp shadows in the helmet molds and highlights the subtle printing details. Avoid harsh front-facing lights that can wash out the intricate details of the torso and leg printing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 9) COLLECTOR DECISION GUIDE */}
        <div className="mb-32" id="decision-guide">
          <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight mb-12 text-center">LEGO Trooper Collector Decision Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                type: 'Beginner', 
                rec: '2020-2026 501st Legion', 
                reason: 'The ultimate entry point for collectors in 2026. High availability due to consistent battle pack releases, combined with exceptional printing and the iconic blue markings. It remains the gold standard for "value-per-grunt" in the 2026 market.' 
              },
              { 
                type: 'Display', 
                rec: 'Scout Trooper (Dual-Molded)', 
                reason: 'A masterpiece of LEGO engineering. The dual-molded helmet provides a level of detail that traditional printing cannot match, capturing the unique visor and vent structure of the Endor recon units. For collectors who prioritize visual fidelity and shelf presence, this variant is the definitive choice for close-up viewing.' 
              },
              { 
                type: 'Completionist', 
                rec: 'Shadow Trooper (2005)', 
                reason: 'A legendary "grail" variant. As one of the earliest specialized trooper designs, its sleek black armor and historical significance make it a must-have for serious archives. Its rarity stems from its limited release window, and finding one in mint condition is a true mark of a dedicated completionist who values the heritage of the theme.' 
              },
              { 
                type: 'Army Building', 
                rec: 'Plain Phase II Clone', 
                reason: 'The perfect blank canvas for massive Republic forces. Its clean, white armor allows it to fit into any legion formation without clashing, providing the necessary bulk for large-scale displays. From a strategic standpoint, amassing these units is the most efficient way to create a sense of overwhelming military scale on a budget.' 
              },
            ].map(guide => (
              <div key={guide.type} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg text-center space-y-4">
                <div className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">{guide.type} Pick</div>
                <h3 className="text-lg font-black text-slate-900 uppercase leading-tight">{guide.rec}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{guide.reason}</p>
              </div>
            ))}
          </div>

          {/* Schema.org Structured Data for SEO */}
          <script type="application/ld+json">
            {JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://minifig-hub.com/"
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Characters",
                    "item": "https://minifig-hub.com/character"
                  },
                  {
                    "@type": "ListItem",
                    "position": 3,
                    "name": "Trooper Hub",
                    "item": "https://minifig-hub.com/character/troopers"
                  }
                ]
              },
              {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "What is the best LEGO Trooper for starting an army?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "The 2020 501st Legion Clone Trooper is widely considered the best starting point due to its high availability in battle packs and iconic design."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Can I mix different eras of Stormtroopers in one display?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "While possible, we recommend keeping eras separate in the front lines. Older variants work best in the rear rows to create depth."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Why are some LEGO Troopers so expensive?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Value is driven by rarity, unique printing, and historical significance. Early specialized variants command high prices due to limited production."
                    }
                  }
                ]
              },
              {
                "@context": "https://schema.org",
                "@type": "ItemList",
                "name": "2026 LEGO Trooper Collector Decision Guide",
                "description": "Expert recommendations for LEGO Trooper minifigure collectors in 2026, categorized by collector type.",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Beginner Pick: 2020-2026 501st Legion Clone Trooper",
                    "description": "High availability and iconic design make this the perfect starting point for new army builders in 2026."
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Display Pick: Dual-Molded Scout Trooper (2026 Edition)",
                    "description": "The highest level of detail and molding accuracy for premium shelf displays in 2026."
                  },
                  {
                    "@type": "ListItem",
                    "position": 3,
                    "name": "Completionist Pick: 2005 Shadow Trooper",
                    "description": "A rare historical variant that remains essential for any comprehensive LEGO Star Wars collection in 2026."
                  },
                  {
                    "@type": "ListItem",
                    "position": 4,
                    "name": "Army Building Pick: Plain Phase II Clone Trooper",
                    "description": "The most versatile and cost-effective unit for building massive Republic formations in 2026."
                  }
                ]
              }
            ])}
          </script>
        </div>

        {/* 10) FAQ SECTION (SEO & UX) */}
        <div className="mb-32">
          <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight mb-12 text-center">Frequently Asked Questions</h2>
          <div className="max-w-4xl mx-auto space-y-6">
            {[
              { 
                q: "What is the best LEGO Trooper for starting an army?", 
                a: "The 2020 501st Legion Clone Trooper is widely considered the best starting point due to its high availability in battle packs and iconic design. It offers excellent value-per-figure for new collectors." 
              },
              { 
                q: "Can I mix different eras of Stormtroopers in one display?", 
                a: "While possible, we recommend keeping eras separate (e.g., 1999 vs 2026) in the front lines. Older variants work best in the rear rows to create depth without breaking visual consistency." 
              },
              { 
                q: "Why are some LEGO Troopers so expensive?", 
                a: "Value is driven by rarity, unique printing (like dual-molding), and historical significance. Early specialized variants like the 2005 Shadow Trooper command high prices due to limited production windows." 
              }
            ].map((faq, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg">
                <h3 className="text-sm font-black text-slate-900 uppercase mb-3 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px]">Q</span>
                  {faq.q}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed pl-9">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 11) CHARACTER GRAPH NAVIGATION */}
        <div className="bg-white rounded-[3rem] p-8 md:p-16 border border-slate-100 shadow-2xl">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
              <GitBranch size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Character Entity Graph</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Armor Comparisons</h3>
              <ul className="space-y-2">
                <li><Link to="/character/troopers/clone-trooper" className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">Clone Trooper Hub</Link></li>
                <li><Link to="/character/troopers/imperial-stormtrooper" className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">Stormtrooper Hub</Link></li>
                <li><Link to="/character/troopers/imperial-stormtrooper/snowtrooper" className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">Snowtrooper Variants</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Legion Archives</h3>
              <ul className="space-y-2">
                <li><Link to="/character/troopers/clone-trooper/501st-legion" className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">501st Legion Database</Link></li>
                <li><Link to="/character/troopers/clone-trooper/212th-battalion" className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">212th Battalion Intel</Link></li>
                <li><Link to="/character/troopers/clone-trooper/shock-trooper" className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">Shock Trooper Intel</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Imperial Formations</h3>
              <ul className="space-y-2">
                <li><Link to="/character/troopers/imperial-stormtrooper" className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">Imperial Army Formations</Link></li>
                <li><Link to="/character/troopers/imperial-stormtrooper/death-trooper" className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">Elite Special Forces</Link></li>
                <li><Link to="/character/troopers/imperial-stormtrooper/scout-trooper" className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">Recon Units</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Collector Tools</h3>
              <ul className="space-y-2">
                <li><Link to="/collection" className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">My Army Inventory</Link></li>
                <li><Link to="/search?q=Rare+Troopers" className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">Rare Variant Tracker</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterHub;
