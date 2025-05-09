import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import './index.css';
import Layout from './Layout.tsx';
import Dashboard from './Dashboard.tsx';
import Settings from './Settings.tsx';
import ControlPanel from './ControlPanel.tsx';
import SystemLogs from './SystemLogs.tsx';
import Analytics from './Analytics.tsx';
import Documentation from './Documentation.tsx';

const router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: '/control', Component: ControlPanel },
      { path: '/logs', Component: SystemLogs },
      { path: '/analytics', Component: Analytics },
      { path: '/documentation', Component: Documentation },
      { path: '/settings', Component: Settings },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
