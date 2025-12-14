import React from 'react';
import ReactDOM from 'react-dom/client';
import Soulingo from './Soulingo'; // Renamed from Suolingo

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Soulingo /> {/* Render Soulingo component */}
  </React.StrictMode>
);