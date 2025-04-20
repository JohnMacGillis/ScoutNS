import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css'; // Import Mantine styles in Mantine v7

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider>
      <App />
    </MantineProvider>
  </React.StrictMode>
);
