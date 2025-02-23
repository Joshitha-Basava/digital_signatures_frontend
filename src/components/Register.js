import React, { useState } from "react";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(?:gmail\.com|yahoo\.com|gvpce\.ac\.in)$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateName = (name) => {
    const nameRegex = /^[A-Za-z _]{6,}$/;
    return nameRegex.test(name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validateName(name)) {
      setMessage("❌ Invalid name! Only letters, spaces, and underscores are allowed.Should be minimum of 6 characters long.");
      return;
    }

    if (!validateEmail(email)) {
      setMessage("❌ Invalid email! Only @gmail.com, @yahoo.com, and @gvpce.ac.in are allowed.");
      return;
    }

    if (!validatePassword(password)) {
      setMessage("❌ Password must be at least 8 characters long, include 1 uppercase, 1 lowercase, 1 number, and 1 special character.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role: "user" }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("✅ Registration successful! You can now log in.");
      } else {
        setMessage(`❌ ${data.detail || "Registration failed."}`);
      }
    } catch (error) {
      setMessage("❌ Error connecting to the server.");
    }
  };

  return (
    <div className="form-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
      {message && <p className="success-message">{message}</p>}
    </div>
  );
}

export default Register;
