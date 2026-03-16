import React, { useEffect } from 'react';
import { AdMobService } from '../services/adMobService';
import { Capacitor } from '@capacitor/core';

// This component is now only used on native platforms to trigger the AdMob banner.
// It does not render any UI itself. For web, AdSense Auto Ads are used.
const AdBanner: React.FC = () => {
  useEffect(() => {
    // This component will only be rendered on native platforms,
    // so we can directly call the AdMob service.
    if (Capacitor.isNativePlatform()) {
      AdMobService.showBanner();
    }
    
    // Cleanup function to remove the banner when the component unmounts
    return () => {
      if (Capacitor.isNativePlatform()) {
        AdMobService.removeBanner();
      }
    };
  }, []);

  return null; // This component doesn't render anything visible
};

export default AdBanner;