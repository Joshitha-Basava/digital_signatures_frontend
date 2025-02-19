import React from "react";
import "../styles/navbar.css"; // Ensure you link your CSS file

function Home() {
  return (
    <div className="home-container">
      <div className="overlay">
        <h1>Welcome to QR-Based Document Authentication</h1>
        <p>Securely verify your documents with digital signatures.</p>
      </div>
    </div>
  );
}

export default Home;
