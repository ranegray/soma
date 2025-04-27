import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router";
import './index.css'
import Layout from './Layout.tsx';
import App from './App.tsx';

const router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      { index: true, Component: App }
    ]
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
