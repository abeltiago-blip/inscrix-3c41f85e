// Safe navigation utilities to replace window.location.href

import { NavigateFunction } from 'react-router-dom';

export class NavigationUtils {
  private static navigate: NavigateFunction | null = null;

  static setNavigate(navigateFunction: NavigateFunction) {
    this.navigate = navigateFunction;
  }

  static safeNavigate(path: string, options?: { replace?: boolean }) {
    if (this.navigate) {
      this.navigate(path, options);
    } else {
      // Fallback to window.location for cases where React Router isn't available
      console.warn('React Router navigate not available, falling back to window.location');
      window.location.href = path;
    }
  }

  static navigateToEvent(eventId: string) {
    this.safeNavigate(`/eventos/${eventId}`);
  }

  static navigateToEventDetail(eventSlug: string) {
    this.safeNavigate(`/event/${eventSlug}`);
  }

  static navigateToLogin() {
    this.safeNavigate('/login');
  }

  static navigateToDashboard() {
    this.safeNavigate('/dashboard');
  }

  static navigateToRegister() {
    this.safeNavigate('/register');
  }

  static goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.safeNavigate('/');
    }
  }

  static isExternalUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.origin !== window.location.origin;
    } catch {
      return false;
    }
  }

  static openExternal(url: string) {
    if (this.isExternalUrl(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      this.safeNavigate(url);
    }
  }
}

export const { 
  safeNavigate, 
  navigateToEvent, 
  navigateToEventDetail,
  navigateToLogin,
  navigateToDashboard,
  navigateToRegister,
  goBack,
  openExternal
} = NavigationUtils;