import React, { useState } from "react";
import Login from "../components/Login";
import Register from "../components/Register";
import "../styles/form.css"; // Import styles

function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-container">
      <div className="auth-box">
        {isLogin ? <Login /> : <Register />}
        <p className="toggle-text">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Auth;
