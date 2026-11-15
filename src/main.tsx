import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { BRAND } from './brand';
import { LearnerProvider } from './ui/LearnerContext';
import './styles.css';

document.title = `${BRAND.name} · adaptive Polish prototype`;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LearnerProvider>
      <App />
    </LearnerProvider>
  </StrictMode>,
);
