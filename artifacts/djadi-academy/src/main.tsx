import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';

import './index.css';

// When VITE_API_URL is set (e.g. on Render where the API is a separate service),
// prefix every /api/... call with that URL so cookies travel cross-origin.
// In dev (Vite proxy forwards /api → local API server) this stays empty.
const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
if (apiUrl) {
  setBaseUrl(apiUrl.replace(/\/+$/, ''));
}

createRoot(document.getElementById('root')!).render(<App />);
