import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import PhoneFrame from './components/PhoneFrame.jsx';
import './index.css';

// PhoneFrame wraps the whole app so the modals (rendered inside App) stay
// descendants of the phone "screen" and are trapped inside the frame on desktop.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PhoneFrame>
      <App />
    </PhoneFrame>
  </StrictMode>
);
