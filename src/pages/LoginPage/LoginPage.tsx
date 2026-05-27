import React, { useState } from "react";
import "./LoginPage.css";
import { authStore } from "../../auth/authStore";

type Props = {
  onLogin: (user: { id: number; username: string; role: string; permissions: string[]; clientId: number | null }) => void;
};

const API_URL = import.meta.env.VITE_API_BASE_URL;

const LoginPage: React.FC<Props> = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [showRegister, setShowRegister] = useState(false);
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regAge, setRegAge] = useState("");
  const [regError, setRegError] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regSecurityQuestion, setRegSecurityQuestion] = useState("");
  const [regSecurityAnswer, setRegSecurityAnswer] = useState("");

  const [step, setStep] = useState<1 | 2 | 3 >(1);
  const [tempToken, setTempToken] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [answerError, setAnswerError] = useState("");


  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotQuestion, setForgotQuestion] = useState("");
  const [forgotAnswer, setForgotAnswer] = useState("");
  const [forgotResetToken, setForgotResetToken] = useState("");
  const [forgotTempToken, setForgotTempToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [regPin, setRegPin] = useState("");
  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        setError("Invalid username or password");
        return;
      }
      const data = await res.json();
      setTempToken(data.tempToken);
      setSecurityQuestion(data.securityQuestion);
      setStep(2);
    } catch {
      setError("Could not connect to server");
    }
  };

  const handleRegister = async () => {
    if (!regUsername || !regPassword || !regConfirm || !regAge || !regEmail || !regSecurityQuestion || !regSecurityAnswer) {
      setRegError("All fields are required");
      return;
    }
    if (regPassword !== regConfirm) {
      setRegError("Passwords do not match");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: regUsername, 
          password: regPassword, 
          age: regAge,
          email: regEmail,
          securityQuestion: regSecurityQuestion,
          securityAnswer: regSecurityAnswer,
          pin: regPin
        })
      });
      if (!res.ok) {
        const data = await res.json();
        setRegError(data.message || "Registration failed");
        return;
      }
      const { token, refreshToken, ...user } = await res.json();
      authStore.setTokens(token, refreshToken);
      onLogin(user);
    } catch {
      setRegError("Could not connect to server");
    }
  };

  const handleVerifyQuestion = async () => {
    if (!securityAnswer.trim()) {
      setAnswerError("Please enter your answer");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/auth/verify-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken, securityAnswer })
      });
      if (!res.ok) {
        setAnswerError("Incorrect answer");
        return;
      }
      const data = await res.json(); 
      setTempToken(data.tempToken); 
      setStep(3);
    } catch {
      setAnswerError("Could not connect to server");
    }
  };
  const handleForgotStep1 = async () => {
    if (!forgotEmail.trim()) {
      setForgotError("Please enter your email");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password/step1`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail })
      });
      if (!res.ok) {
        const data = await res.json();
        setForgotError(data.message || "Email not found");
        return;
      }
      const data = await res.json();
      setForgotTempToken(data.tempToken);
      setForgotQuestion(data.securityQuestion);
      setForgotError("");
      setForgotStep(2);
    } catch {
      setForgotError("Could not connect to server");
    }
  };

  const handleForgotStep2 = async () => {
    if (!forgotAnswer.trim()) {
      setForgotError("Please enter your answer");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password/step2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken: forgotTempToken, securityAnswer: forgotAnswer })
      });
      if (!res.ok) {
        const data = await res.json();
        setForgotError(data.message || "Incorrect answer");
        return;
      }
      const data = await res.json();
      setForgotResetToken(data.resetToken);
      setForgotError("");
      setForgotStep(3);
    } catch {
      setForgotError("Could not connect to server");
    }
  };

  const handleForgotStep3 = async () => {
    if (!newPassword || !confirmNewPassword) {
      setForgotError("Please fill in both fields");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setForgotError("Passwords do not match");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password/step3`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken: forgotResetToken, newPassword })
      });
      if (!res.ok) {
        const data = await res.json();
        setForgotError(data.message || "Reset failed");
        return;
      }
      setForgotSuccess("Password reset successfully! You can now log in.");
      setForgotError("");
      setTimeout(() => {
        setShowForgot(false);
        setForgotStep(1);
        setForgotEmail("");
        setForgotAnswer("");
        setNewPassword("");
        setConfirmNewPassword("");
        setForgotSuccess("");
      }, 2000);
    } catch {
      setForgotError("Could not connect to server");
    }
  };

  const handleVerifyPin = async () => {
    if (!/^\d{4}$/.test(pin)) {
      setPinError("Please enter a valid 4-digit PIN");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/auth/verify-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken, pin })
      });
      if (!res.ok) {
        setPinError("Incorrect PIN");
        return;
      }
      const { token, refreshToken, ...user } = await res.json();
      authStore.setTokens(token, refreshToken);
      onLogin(user);
    } catch {
      setPinError("Could not connect to server");
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">FITNESS APP</h1>
        {step === 1 && (
          <>
            <p className="login-subtitle">Sign in to continue</p>
            <input className="login-input" type="text" placeholder="Username"
              value={username} onChange={(e) => setUsername(e.target.value)} />
            <input className="login-input" type="password" placeholder="Password"
              value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <p className="login-error">{error}</p>}
            <button className="login-btn" onClick={handleLogin}>Login</button>
            <button className="register-link" onClick={() => { setShowRegister(true); setRegError(""); }}>
              Don't have an account? Register
            </button>
            <button className="register-link" onClick={() => setShowForgot(true)}>
              Forgot password?
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <p className="login-subtitle">Security verification</p>
            <p className="login-question">{securityQuestion}</p>
            <input className="login-input" type="text" placeholder="Your answer"
              value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} />
            {answerError && <p className="login-error">{answerError}</p>}
            <button className="login-btn" onClick={handleVerifyQuestion}>Verify</button>
            <button className="register-link" onClick={() => { setStep(1); setSecurityAnswer(""); }}>
              Back
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <p className="login-subtitle">Enter your 4-digit PIN</p>
            <input 
              className="login-input" 
              type="password" 
              placeholder="PIN"
              maxLength={4}
              value={pin} 
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} 
            />
            {pinError && <p className="login-error">{pinError}</p>}
            <button className="login-btn" onClick={handleVerifyPin}>Verify PIN</button>
            <button className="register-link" onClick={() => { setStep(2); setPin(""); setPinError(""); }}>
              Back
            </button>
          </>
        )}
      </div>

      {showRegister && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="login-title">Create Account</h2>

            <input className="login-input" type="text" placeholder="Username"
              value={regUsername} onChange={(e) => setRegUsername(e.target.value)} />

            <input className="login-input" type="email" placeholder="Email"
              value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />

            <input className="login-input" type="number" placeholder="Age"
              value={regAge} onChange={(e) => setRegAge(e.target.value)} />

            <input className="login-input" type="password" placeholder="Password"
              value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />

            <input className="login-input" type="password" placeholder="Confirm Password"
              value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} />

            <input 
              className="login-input" 
              type="password" 
              placeholder="4-digit PIN"
              maxLength={4}
              value={regPin} 
              onChange={(e) => setRegPin(e.target.value.replace(/\D/g, ""))}
            />

            <select className="login-input" value={regSecurityQuestion}
              onChange={(e) => setRegSecurityQuestion(e.target.value)}>
              <option value="">Select a security question</option>
              <option value="What was the name of your first pet?">What was the name of your first pet?</option>
              <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
              <option value="What was the name of your first school?">What was the name of your first school?</option>
              <option value="What is your favourite sports team?">What is your favourite sports team?</option>
            </select>

            <input className="login-input" type="text" placeholder="Security Answer"
              value={regSecurityAnswer} onChange={(e) => setRegSecurityAnswer(e.target.value)} />

            {regError && <p className="login-error">{regError}</p>}

            <button className="login-btn" onClick={handleRegister}>Register</button>
            <button className="register-link" onClick={() => setShowRegister(false)}>
              Back to Login
            </button>
          </div>
        </div>
      )}

      {showForgot && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="login-title">Password Recovery</h2>

            {forgotStep === 1 && (
              <>
                <p className="login-subtitle">Enter your email address</p>
                <input className="login-input" type="email" placeholder="Email"
                  value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
                {forgotError && <p className="login-error">{forgotError}</p>}
                <button className="login-btn" onClick={handleForgotStep1}>Next</button>
                <button className="register-link" onClick={() => { setShowForgot(false); setForgotStep(1); setForgotError(""); }}>
                  Back to Login
                </button>
              </>
            )}

            {forgotStep === 2 && (
              <>
                <p className="login-subtitle">Answer your security question</p>
                <p className="login-question">{forgotQuestion}</p>
                <input className="login-input" type="text" placeholder="Your answer"
                  value={forgotAnswer} onChange={(e) => setForgotAnswer(e.target.value)} />
                {forgotError && <p className="login-error">{forgotError}</p>}
                <button className="login-btn" onClick={handleForgotStep2}>Next</button>
                <button className="register-link" onClick={() => { setForgotStep(1); setForgotError(""); }}>
                  Back
                </button>
              </>
            )}

            {forgotStep === 3 && (
              <>
                <p className="login-subtitle">Set your new password</p>
                <input className="login-input" type="password" placeholder="New password"
                  value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <input className="login-input" type="password" placeholder="Confirm new password"
                  value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
                {forgotError && <p className="login-error">{forgotError}</p>}
                {forgotSuccess && <p className="login-success">{forgotSuccess}</p>}
                <button className="login-btn" onClick={handleForgotStep3}>Reset Password</button>
                <button className="register-link" onClick={() => { setForgotStep(2); setForgotError(""); }}>
                  Back
                </button>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default LoginPage;