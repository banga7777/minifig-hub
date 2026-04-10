import React from 'react';
import { useParams, Link } from 'react-router-dom';
import journalData from '../data/journal.json';
import { JournalPost } from '../types';
import SEO from '../components/SEO';

const JournalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const post = (journalData as JournalPost[]).find((p) => p.id === id);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-black text-slate-900 mb-4">Post Not Found</h1>
          <Link to="/journal" className="text-indigo-600 font-bold">Back to Journal</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-12 pb-24 px-4">
      <SEO title={`${post.title} - Collector's Journal`} description={post.summary} />
      <article className="max-w-4xl mx-auto bg-white p-8 sm:p-16 rounded-[3rem] shadow-sm border border-slate-100">
        <Link to="/journal" className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-8 block hover:text-indigo-800 transition-colors">&larr; Back to Journal</Link>
        
        <header className="mb-12 border-b border-slate-100 pb-12">
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 mb-6 leading-[1.1] tracking-tighter">{post.title}</h1>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            <span>10 min read</span>
          </div>
        </header>

        <div className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-p:leading-relaxed prose-p:text-slate-700">
          {post.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-6">{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  );
};

export default JournalDetail;
