import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { IntlProviderWrapper } from './utils/context/i11n';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <IntlProviderWrapper>
      <App />
    </IntlProviderWrapper>
  </React.StrictMode>
);
