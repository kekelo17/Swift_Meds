import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './front-end/CSS/index.css'
import PharmacyDashboard from './front-end/dashboard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <PharmacyDashboard/>
  </StrictMode>
)
