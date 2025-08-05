import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './front-end/CSS/index.css'
import PharmacyDashboard from './front-end/enhanced frontend'


createRoot(document.getElementById('root')).render(
  <StrictMode>
      <PharmacyDashboard/>
  </StrictMode>
)
