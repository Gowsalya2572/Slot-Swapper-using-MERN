import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div data-theme="light" className="min-h-screen bg-base-200">
         <App />
    </div>
  </StrictMode>,
)
