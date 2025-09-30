import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n/config'

try {
  const root = document.getElementById("root");
  if (!root) {
    throw new Error('Root element not found');
  }
  // Performance optimized rendering
  createRoot(root).render(<App />);
} catch (error) {
  console.error('Error starting application:', error);
}
