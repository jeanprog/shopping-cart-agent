import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { App } from './App';
import './index.css';

/** Deve ser idêntico a `GOOGLE_CLIENT_ID` na API (mesmo cliente OAuth tipo Web). */
const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "").trim();

export const Root = () => {
  if (!googleClientId) {
    return <App />;
  }
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);