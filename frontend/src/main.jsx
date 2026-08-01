import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './redux/store';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

// Registers the global 401/session-expiry handler exactly once,
// before the app renders. Every axios call anywhere on the
// platform is now covered automatically — see
// frontend/src/utils/axiosSessionInterceptor.js for what it does.
import { initAxiosSessionInterceptor } from './utils/axiosSessionInterceptor';
initAxiosSessionInterceptor();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);