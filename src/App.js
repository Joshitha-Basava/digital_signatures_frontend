import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./components/Dashboard";
import UploadDocument from "./components/UploadDocument";
import VerifyQR from "./components/VerifyQR";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<UploadDocument />} />
        <Route path="/verify" element={<VerifyQR />} />
      </Routes>
    </Router>
  );
}

export default App;
