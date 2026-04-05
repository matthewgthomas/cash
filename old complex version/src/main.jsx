import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import CashAssistanceDecisionSupportTool from '../cash.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CashAssistanceDecisionSupportTool />
  </StrictMode>
);
