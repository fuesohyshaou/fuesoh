import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import { AuthProvider } from '../auth.jsx';
import Signup from './components/Signup.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <Signup />
    </AuthProvider>
  </StrictMode>
);