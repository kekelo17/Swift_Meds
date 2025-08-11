import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Homepage = () => {
    const navigate = useNavigate()
  return (
    <div>
        <button onClick={()=> navigate("/signin")}>Login</button>
        <Link to="/signup">Singup</Link>
    </div>
  )
}

export default Homepage