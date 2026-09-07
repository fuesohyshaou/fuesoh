import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import { AuthProvider } from '../auth.jsx';
import TechnicianApp from './TechnicianApp.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <TechnicianApp />
    </AuthProvider>
  </StrictMode>
);