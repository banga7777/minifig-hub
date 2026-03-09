import React from 'react';
import SEO from '../components/SEO';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 pb-32">
      <SEO 
        title="Privacy Policy | MinifigHub" 
        description="Privacy Policy for MinifigHub, detailing how we handle your data." 
      />
      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200">
        <h1 className="text-2xl font-black italic uppercase tracking-tight text-slate-900 mb-6">Privacy Policy</h1>
        
        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">1. Information We Collect</h2>
            <p>
              When you use MinifigHub, we may collect personal information such as your email address if you choose to create an account. We also collect non-personal information such as browser type, device information, and usage data to improve our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">2. How We Use Your Information</h2>
            <p>
              We use the information we collect to provide, maintain, and improve our services, including saving your collection data, personalizing your experience, and communicating with you about updates or security alerts.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">3. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">4. Third-Party Services</h2>
            <p>
              We may employ third-party companies and individuals to facilitate our service, provide the service on our behalf, perform service-related services, or assist us in analyzing how our service is used (e.g., Google Analytics, Google AdSense). These third parties have access to your personal data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">5. Data Security</h2>
            <p>
              The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">6. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">7. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us via the About Us page.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
