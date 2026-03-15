import React from 'react';
import SEO from '../components/SEO';

const TermsOfService: React.FC = () => {
  return (
    <main className="w-full max-w-3xl mx-auto px-4 py-8 pb-32">
      <SEO 
        title="Terms of Service | MinifigHub" 
        description="Terms of Service for using MinifigHub." 
      />
      <article className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200">
        <header className="mb-6">
          <h1 className="text-2xl font-black italic uppercase tracking-tight text-slate-900">Terms of Service</h1>
        </header>
        
        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing and using MinifigHub, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">2. Description of Service</h2>
            <p>
              MinifigHub is an unofficial fan site and collection management tool for LEGO® Star Wars™ minifigures. We provide a platform for users to track their collections, view statistics, and explore minifigure data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">3. User Accounts</h2>
            <p>
              To use certain features of the service, you must register for an account. You are responsible for maintaining the confidentiality of your account and password.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">4. Intellectual Property and Disclaimer</h2>
            <p>
              MinifigHub is an unofficial fan site. We are not affiliated with, sponsored by, or endorsed by the LEGO Group, Lucasfilm Ltd., or The Walt Disney Company. LEGO® and the LEGO logo are trademarks of the LEGO Group. Star Wars™ and all related characters, names, and indicia are trademarks of &copy; Lucasfilm Ltd.
            </p>
            <p className="mt-2">
              All original content, features, and functionality of MinifigHub (excluding the aforementioned trademarks and copyrighted materials) are owned by MinifigHub.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">5. User Conduct</h2>
            <p>
              You agree not to use the service for any unlawful purpose or in any way that might harm, damage, or disparage any other party.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">6. Limitation of Liability</h2>
            <p>
              In no event shall MinifigHub, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">7. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
};

export default TermsOfService;
