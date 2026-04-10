import React from 'react';
import { Link } from 'react-router-dom';
import journalData from '../data/journal.json';
import { JournalPost } from '../types';
import SEO from '../components/SEO';

const JournalList: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 pt-12 pb-24 px-4">
      <SEO title="Collector's Journal - Minifig Hub" description="Insights, tips, and stories from LEGO minifigure collectors." />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 uppercase tracking-tighter mb-16 italic text-center">Collector's Journal</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(journalData as JournalPost[]).map((post) => (
            <Link key={post.id} to={`/journal/${post.id}`} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:border-indigo-200 transition-all group flex flex-col">
              <div className="mb-6">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Collector's Journal</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors leading-tight tracking-tight flex-grow">{post.title}</h2>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed line-clamp-3">{post.summary}</p>
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest mt-auto group-hover:underline">Read Article &rarr;</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JournalList;
