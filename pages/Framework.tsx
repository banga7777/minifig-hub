import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minifigure } from '../types';
import SEO from '../components/SEO';
import { generateSlug } from '../utils/slug';
import MinifigCard from '../components/MinifigCard';
import { FRAMEWORK_CATEGORIES } from '../src/constants/frameworkData';

interface FrameworkProps {
  allMinifigs: Minifigure[];
  onToggleOwned: (id: string) => void;
}

const Framework: React.FC<FrameworkProps> = ({ allMinifigs, onToggleOwned }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      <SEO 
        title="LEGO Star Wars Minifigure Master Archive | Collector Framework"
        description="The ultimate LEGO Star Wars minifigure database. Categorized by role: Army Builders, Character Centerpieces, Elite Specialists, and Support Units."
        keywords="LEGO Star Wars, Minifigure Database, Collector Framework, Army Building, Rare LEGO Minifigures"
      />
      {/* Hero Section */}
      <header className="relative pt-12 pb-16 px-6 overflow-hidden bg-slate-950">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/20 rounded-full blur-[100px] opacity-30"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">The Galaxy's Largest Entity Database</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-[0.85] mb-8"
          >
            LEGO Star Wars <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400">Minifigure Master Archive</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium mb-12"
          >
            The Collector's Master Edition: A comprehensive archive analyzing every official entity from the first classic models to the latest releases, including detailed printing variations.
          </motion.p>
        </div>
      </header>

      {/* Core Classification Grid */}
      <section className="py-16 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em] mb-4">Core Classification Grid</h2>
              <p className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                Structured Entity <br/> Taxonomy
              </p>
            </div>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              Our database is structured into four primary pillars, each containing detailed entity clusters to ensure maximum precision and discoverability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {FRAMEWORK_CATEGORIES.map((cat, idx) => (
              <motion.div 
                key={cat.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative overflow-hidden rounded-[2.5rem] bg-slate-950 border border-white/5 hover:border-indigo-500/30 transition-all duration-500"
              >
                {/* Background Glow */}
                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-10 blur-[80px] transition-opacity duration-700`}></div>
                
                <div className="p-8 md:p-12 relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl grayscale group-hover:grayscale-0 transition-all duration-500">{cat.icon}</span>
                      <div>
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">{cat.title}</h3>
                        <div className="h-1 w-12 bg-indigo-600 rounded-full mt-1"></div>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Cluster 0{idx + 1}</span>
                  </div>

                  <p className="text-slate-400 text-sm mb-10 leading-relaxed">
                    {cat.summary}
                  </p>

                  <div className="space-y-6 mb-12">
                    {cat.clusters.map((cluster, i) => (
                      <div key={i} className="group/item">
                        <h4 className="text-white text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                          {cluster.name}
                        </h4>
                        <p className="text-slate-500 text-xs leading-relaxed group-hover/item:text-slate-300 transition-colors">
                          {cluster.details}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Link 
                    to={cat.link}
                    className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all duration-300 group/btn"
                  >
                    Explore {cat.title} Hub
                    <i className="fas fa-arrow-right group-hover/btn:translate-x-1 transition-transform"></i>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Entities Section */}
      <section className="py-16 px-6 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em] mb-4">Featured Entities</h2>
              <p className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Iconic Masterpieces</p>
            </div>
            <Link to="/themes/star-wars" className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">View All Star Wars <i className="fas fa-arrow-right ml-1"></i></Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {allMinifigs
              .filter(m => m.theme_slug === 'star-wars' && ['sw0001', 'sw0188', 'sw0636', 'sw1135', 'sw0585', 'sw1000'].includes(m.item_no))
              .map((m) => (
                <MinifigCard 
                  key={m.item_no} 
                  minifig={m} 
                  variant="dark"
                  onToggleOwned={onToggleOwned}
                  onClick={() => navigate(`/minifigs/${m.item_no}-${generateSlug(m.name)}`)}
                />
              ))}
          </div>
        </div>
      </section>


    </div>
  );
};

export default Framework;
