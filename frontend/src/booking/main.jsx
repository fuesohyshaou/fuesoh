import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import Booking from './Booking.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Booking />
  </StrictMode>
);