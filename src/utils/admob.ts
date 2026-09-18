import { AdMob, BannerAdPosition, BannerAdSize } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

export const ADMOB_APP_ID = 'ca-app-pub-2133508635089094~8382428566';
export const ADMOB_BANNER_ID = 'ca-app-pub-2133508635089094/3314943873';
export const ADMOB_INTERSTITIAL_ID = 'ca-app-pub-2133508635089094/9974711835';

let initialized = false;

export async function initializeAdMob() {
  if (!Capacitor.isNativePlatform()) {
    console.log('AdMob: Skipping non-native web platform');
    return;
  }

  if (initialized) return;

  try {
    await AdMob.initialize({
      testingDevices: [],
      initializeForTesting: false,
    });
    initialized = true;
    console.log('AdMob initialized successfully with App ID:', ADMOB_APP_ID);

    // Automatically trigger bottom banner ad on native launch
    showBannerAd();
  } catch (err) {
    console.warn('AdMob initialization error:', err);
  }
}

export async function showBannerAd() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await AdMob.showBanner({
      adId: ADMOB_BANNER_ID,
      adSize: BannerAdSize.BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: false,
    });
    console.log('AdMob Banner shown!');
  } catch (err) {
    console.warn('AdMob Banner show error:', err);
  }
}

export async function hideBannerAd() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await AdMob.hideBanner();
  } catch (err) {
    console.warn('AdMob Banner hide error:', err);
  }
}

export async function showInterstitialAd() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await AdMob.prepareInterstitial({
      adId: ADMOB_INTERSTITIAL_ID,
      isTesting: false,
    });
    await AdMob.showInterstitial();
    console.log('AdMob Interstitial shown!');
  } catch (err) {
    console.warn('AdMob Interstitial show error:', err);
  }
}
