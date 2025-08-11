import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignIn from './pages/auth/signin.jsx';
import Signup from './pages/auth/signup.jsx';
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