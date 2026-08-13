import { ImageConfig } from '../types';
import {
  DEFAULT_HERO_IMAGE,
  DEFAULT_BANNER_IMAGE,
  DEFAULT_LOGO,
  DEFAULT_BOT_AVATAR,
  DEFAULT_APP_ICON,
} from './defaultImages';

const STORAGE_KEY = 'sapahati_custom_images';

export const DEFAULT_IMAGES: ImageConfig = {
  heroImage: DEFAULT_HERO_IMAGE,
  bannerImage: DEFAULT_BANNER_IMAGE,
  logoImage: DEFAULT_LOGO,
  botAvatar: DEFAULT_BOT_AVATAR,
  appIcon: DEFAULT_APP_ICON,
};

type ImageListener = (config: ImageConfig) => void;
const listeners: Set<ImageListener> = new Set();

export function getImageConfig(): ImageConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        heroImage: parsed.heroImage || DEFAULT_IMAGES.heroImage,
        bannerImage: parsed.bannerImage || DEFAULT_IMAGES.bannerImage,
        logoImage: parsed.logoImage || DEFAULT_IMAGES.logoImage,
        botAvatar: parsed.botAvatar || DEFAULT_IMAGES.botAvatar,
        appIcon: parsed.appIcon || DEFAULT_IMAGES.appIcon,
      };
    }
  } catch {
    // Fallback to defaults
  }
  return DEFAULT_IMAGES;
}

export function saveImageConfig(newConfig: Partial<ImageConfig>): ImageConfig {
  const current = getImageConfig();
  const updated: ImageConfig = {
    ...current,
    ...newConfig,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Quota error fallback
  }
  notifyListeners(updated);
  return updated;
}

export function resetImageConfig(): ImageConfig {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
  notifyListeners(DEFAULT_IMAGES);
  return DEFAULT_IMAGES;
}

export function subscribeImageConfig(listener: ImageListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(config: ImageConfig) {
  listeners.forEach((listener) => {
    try {
      listener(config);
    } catch (e) {
      console.error('Image store listener error:', e);
    }
  });
}
