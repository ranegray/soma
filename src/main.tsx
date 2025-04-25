import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router"
import './index.css'
import App from './App.tsx'
import { WebSocketProvider } from './context/useWebSocketContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WebSocketProvider url="ws://localhost:8000/ws">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
        </Routes>
      </BrowserRouter>
    </WebSocketProvider>
  </StrictMode>
)
