import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { OktoProvider, BuildType } from "okto-sdk-react";
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OktoProvider apiKey={'1d05bf0e-4a6b-4438-81e8-2e43896932a8'} buildType={BuildType.SANDBOX}>
      <App />
    </OktoProvider>
  </StrictMode>,
)
