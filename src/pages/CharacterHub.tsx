import React from 'react';
import { Link } from 'react-router-dom';
import { starWarsCharacters } from '../services/characterData';
import { CHARACTER_FAMILY } from '../services/characterClassifier';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import { Star, Shield, Swords, Users } from 'lucide-react';

const CharacterHub: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0c14] text-white font-sans pb-24">
      <SEO 
        title="LEGO Star Wars Character Hub | The Ultimate Collector Guide"
        description="Explore the complete collection of iconic LEGO Star Wars characters. From Jedi Masters to Sith Lords, track every variant and build your ultimate display."
        keywords="LEGO Star Wars, Luke Skywalker LEGO, Darth Vader LEGO, Han Solo LEGO, Mandalorian LEGO"
      />
      
      {/* Hero Section */}
      <div className="relative pt-24 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] -mr-48 -mt-48"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-6">
            <Star size={12} />
            <span>Legendary Characters</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mb-6 leading-none">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Star Wars</span> Family
          </h1>
          <p className="text-slate-400 font-medium max-w-2xl mx-auto text-lg mb-12">
            The definitive guide to the galaxy's most iconic heroes and villains in LEGO® form.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {starWarsCharacters.map((character, index) => (
            <motion.div
              key={character.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/character/${CHARACTER_FAMILY}/${character.id}`} className="group block h-full">
                <div className="bg-[#151926] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-indigo-500/50 transition-all duration-500 h-full flex flex-col shadow-2xl">
                  <div className="aspect-[4/5] bg-slate-900/50 relative p-8 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <img 
                      src={character.imageUrl} 
                      alt={character.name} 
                      className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-8 flex-grow flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Character Profile</span>
                    </div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tight mb-4 group-hover:text-indigo-400 transition-colors">
                      {character.name}
                    </h2>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6 line-clamp-3">
                      {character.description}
                    </p>
                    <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/20">View Collection</span>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                        <Star size={14} className="group-hover:text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="max-w-4xl mx-auto px-6 mt-24">
        <div className="bg-gradient-to-br from-indigo-900/40 to-violet-900/40 border border-white/10 rounded-[3rem] p-12 text-center backdrop-blur-xl">
          <h3 className="text-3xl font-black italic uppercase tracking-tight mb-4">Missing a Legend?</h3>
          <p className="text-slate-300 font-medium mb-8">
            Our database is constantly expanding. If you're looking for specialized units, check our Trooper Hub.
          </p>
          <Link 
            to="/character/troopers" 
            className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest hover:bg-indigo-50 transition-colors shadow-xl shadow-white/10"
          >
            <Users size={16} />
            Explore Trooper Hub
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CharacterHub;
