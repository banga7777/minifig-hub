import { Capacitor } from '@capacitor/core';
// [중요] 정적 import(static import)를 제거하고 타입만 가져옵니다.
// 이렇게 해야 웹에서 네이티브 라이브러리를 로드하려다 멈추는 현상이 사라집니다.
import type { BannerAdOptions } from '@capacitor-community/admob';

// ------------------------------------------------------------------
// [AdMob 설정]
// ------------------------------------------------------------------

const BANNER_ID = 'ca-app-pub-1085744771899341/7061418437';
const INTERSTITIAL_ID = 'ca-app-pub-1085744771899341/1521688275';
const NAV_BAR_HEIGHT = 60;

// Timing Constants
const NEXT_AD_TIME_KEY = 'admob_next_interstitial_time';
const VIEW_COUNT_KEY = 'minifig_detail_view_count';
const VIEW_THRESHOLD_KEY = 'admob_view_threshold';
const MIN_INTERVAL_MS = 3 * 60 * 1000; 
const MAX_INTERVAL_MS = 10 * 60 * 1000;
const ERROR_COOLDOWN_MS = 1 * 60 * 1000;

export const AdMobService = {
  initialize: async () => {
    // [웹 환경] AdMob 로딩 시도조차 하지 않음
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      // [동적 Import] 앱 환경일 때만 라이브러리를 메모리에 올립니다.
      const { AdMob } = await import('@capacitor-community/admob');
      
      await AdMob.initialize({
        initializeForTesting: false, 
      });
      console.log('AdMob initialized');
    } catch (e) {
      console.error('AdMob init failed', e);
    }
  },

  showBanner: async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      // [동적 Import] Enum 값들도 여기서 불러와야 합니다.
      const { AdMob, BannerAdSize, BannerAdPosition } = await import('@capacitor-community/admob');

      const options: BannerAdOptions = {
        adId: BANNER_ID, 
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: NAV_BAR_HEIGHT,
        isTesting: false,
        npa: true
      };
      await AdMob.showBanner(options);
    } catch (e) {
      console.error('Show banner failed', e);
    }
  },

  hideBanner: async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const { AdMob } = await import('@capacitor-community/admob');
      await AdMob.hideBanner();
    } catch (e) {}
  },
  
  removeBanner: async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const { AdMob } = await import('@capacitor-community/admob');
      await AdMob.removeBanner();
    } catch (e) {}
  },

  prepareInterstitial: async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const { AdMob } = await import('@capacitor-community/admob');
      await AdMob.prepareInterstitial({
        adId: INTERSTITIAL_ID,
        isTesting: false
      });
    } catch (e) {
      console.error('Prepare interstitial failed', e);
    }
  },

  showInterstitial: async (): Promise<void> => {
    // [웹 환경] 즉시 종료 (오류 방지)
    if (!Capacitor.isNativePlatform()) return;

    // [앱 환경] 기존 로직 수행
    let viewThreshold = parseInt(sessionStorage.getItem(VIEW_THRESHOLD_KEY) || '0', 10);
    if (viewThreshold === 0) {
      viewThreshold = Math.floor(Math.random() * (12 - 8 + 1)) + 8;
      sessionStorage.setItem(VIEW_THRESHOLD_KEY, viewThreshold.toString());
    }
    
    const viewCount = parseInt(sessionStorage.getItem(VIEW_COUNT_KEY) || '0', 10);
    if (viewCount < viewThreshold) return;
    
    const now = Date.now();
    const nextAdTime = parseInt(sessionStorage.getItem(NEXT_AD_TIME_KEY) || '0', 10);
    if (now < nextAdTime) return;

    const resetForNextAd = () => {
      const newCooldown = Math.floor(Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS)) + MIN_INTERVAL_MS;
      sessionStorage.setItem(NEXT_AD_TIME_KEY, (now + newCooldown).toString());
      sessionStorage.setItem(VIEW_COUNT_KEY, '0');
      const newThreshold = Math.floor(Math.random() * (12 - 8 + 1)) + 8;
      sessionStorage.setItem(VIEW_THRESHOLD_KEY, newThreshold.toString());
    };

    try {
      const { AdMob } = await import('@capacitor-community/admob');
      await AdMob.showInterstitial();
      resetForNextAd();
      
      // 재준비
      const { AdMob: AdMobRe } = await import('@capacitor-community/admob');
      await AdMobRe.prepareInterstitial({
        adId: INTERSTITIAL_ID,
        isTesting: false
      });
    } catch (e) {
      console.error('Show interstitial failed', e);
      sessionStorage.setItem(NEXT_AD_TIME_KEY, (now + ERROR_COOLDOWN_MS).toString());
      
      // 실패 시에도 재준비 시도
      try {
        const { AdMob: AdMobRe } = await import('@capacitor-community/admob');
        await AdMobRe.prepareInterstitial({
          adId: INTERSTITIAL_ID,
          isTesting: false
        });
      } catch (err) {}
    }
  }
};