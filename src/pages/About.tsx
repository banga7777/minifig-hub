import React from 'react';
import SEO from '../components/SEO';

const About: React.FC = () => {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 pb-32">
      <SEO 
        title="About Us | MinifigHub" 
        description="Learn more about MinifigHub, the ultimate LEGO Star Wars minifigure collection tracker." 
      />
      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200">
        <h1 className="text-2xl font-black italic uppercase tracking-tight text-slate-900 mb-6">About MinifigHub</h1>
        
        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Our Mission</h2>
            <p>
              MinifigHub was created by and for LEGO® Star Wars™ enthusiasts. Our mission is to provide the most comprehensive, user-friendly, and visually appealing platform for collectors to track, manage, and explore their minifigure collections.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">What We Do</h2>
            <p>
              We offer a digital hub where you can mark figures you own, view detailed statistics about your collection, explore market trends, and discover the rich history and evolution of LEGO Star Wars minifigures through our Collector Framework.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Disclaimer</h2>
            <p className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-500 italic">
              MinifigHub is an unofficial fan site. We are not affiliated with, sponsored by, or endorsed by the LEGO Group, Lucasfilm Ltd., or The Walt Disney Company.
              <br /><br />
              LEGO® and the LEGO logo are trademarks of the LEGO Group. Star Wars™ and all related characters, names, and indicia are trademarks of &copy; Lucasfilm Ltd.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Contact Us</h2>
            <p>
              Have questions, suggestions, or found a bug? We'd love to hear from you.
            </p>
            <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                <i className="fas fa-envelope"></i>
              </div>
              <div>
                <p className="font-bold text-slate-900">Email Us</p>
                <a href="mailto:minifighub7@gmail.com" className="text-indigo-600 hover:underline">minifighub7@gmail.com</a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
