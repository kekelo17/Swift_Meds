import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Homepage from './pages/Homepage';
import PharmacyDashboard from "./pages/dashboard.jsx"; 

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Homepage />} /> 
        <Route path='/dashboard' element={<PharmacyDashboard />} /> 
      </Routes>
    </Router>
  )
}

export default App