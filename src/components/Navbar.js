import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./../styles/navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  return (
    <nav className="navbar">
      <h2 className="title">QR Auth</h2>
      <div>
        <Link to="/">Home</Link>
        <Link to="/upload">Upload</Link>
        <Link to="/verify">Verify</Link>
        <Link to="/dashboard">Dashboard</Link>
        {localStorage.getItem("token") ? (
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          ) : (
            <button className="logout-btn" onClick={() => navigate("/auth")}>Login</button>
          )}
      </div>
    </nav>
  );
}

export default Navbar;
