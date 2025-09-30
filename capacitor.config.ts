import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ece8ba0891dc4e96a55834d9f72bceb3',
  appName: 'inscrix',
  webDir: 'dist',
  server: {
    url: 'https://ece8ba08-91dc-4e96-a558-34d9f72bceb3.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: {
        camera: 'Camera access is required for QR code scanning'
      }
    }
  }
};

export default config;