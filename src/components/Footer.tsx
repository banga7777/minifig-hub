import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-900 text-slate-400 py-8 px-4 border-t border-slate-800">
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center space-y-6">
        <div className="flex flex-wrap justify-center gap-4 text-xs font-medium">
          <Link to="/about" className="hover:text-indigo-400 transition-colors">About Us</Link>
          <Link to="/privacy-policy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link>
          <Link to="/terms-of-service" className="hover:text-indigo-400 transition-colors">Terms of Service</Link>
        </div>
        
        <div className="text-[10px] leading-relaxed max-w-2xl opacity-70 space-y-2">
          <p>
            <strong>Disclaimer:</strong> This site is an unofficial fan site and is not affiliated with, sponsored by, or endorsed by the LEGO Group, Lucasfilm Ltd., or The Walt Disney Company.
          </p>
          <p>
            LEGO® and the LEGO logo are trademarks of the LEGO Group. Star Wars™ and all related characters, names, and indicia are trademarks of &copy; Lucasfilm Ltd.
          </p>
          <p>
            MinifigHub &copy; {new Date().getFullYear()}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
