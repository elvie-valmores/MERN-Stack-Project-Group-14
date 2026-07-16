import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Trophy
} from "lucide-react";
import achievementLogo from "../assets/images/223-cropped.png";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");

    if (rememberedEmail) {
      setFormData((current) => ({
        ...current,
        email: rememberedEmail
      }));

      setRememberMe(true);
    }
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });

    setMessage("");
  };

  const validateForm = () => {
    if (!formData.email.trim() || !formData.password.trim()) {
      setMessage("Please enter your email and password.");
      setMessageType("error");
      return false;
    }

    if (!formData.email.includes("@")) {
      setMessage("Please enter a valid email address.");
      setMessageType("error");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5050/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Incorrect email or password.");
        setMessageType("error");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data));

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      setMessage("Login successful. Opening your dashboard...");
      setMessageType("success");

      setTimeout(() => {
        navigate("/dashboard");
      }, 600);
    } catch (error) {
      setMessage(
        "Cannot connect to the server. Make sure the backend is running."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-split-page">
      <Link to="/" className="auth-back-link login-back-link">
        <ArrowLeft size={18} />
        Back to Home
      </Link>

      <div className="login-split-card">
        <section className="login-showcase">
          <Link to="/" className="login-showcase-logo">
            <img
              src={achievementLogo}
              alt="Achievement Hub"
            />
          </Link>

          <div className="login-showcase-content">
            <span className="login-eyebrow">
              Welcome back
            </span>

            <h1>
              Continue your
              <span> gaming journey.</span>
            </h1>

            <p>
              Log in to track your games, unlock achievements, and see your
              progress in one place.
            </p>

            <div className="login-benefits">
              <div>
                <CheckCircle2 />
                <span>Track your Steam library</span>
              </div>

              <div>
                <Trophy />
                <span>Monitor achievement progress</span>
              </div>

              <div>
                <ShieldCheck />
                <span>Keep your account secure</span>
              </div>
            </div>
          </div>
        </section>

        <section className="login-form-side">
          <div className="login-form-heading">
            <h2>Log In</h2>
            <p>Enter your account details to continue.</p>
          </div>

          {message && (
            <div className={`auth-message ${messageType}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="login-email">
              Email Address
            </label>

            <div className="auth-input-group">
              <Mail size={20} />

              <input
                id="login-email"
                name="email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <label htmlFor="login-password">
              Password
            </label>

            <div className="auth-input-group">
              <LockKeyhole size={20} />

              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            <div className="auth-options">
              <label className="remember-option">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(event.target.checked)
                  }
                />

                <span>Remember me</span>
              </label>

              <Link to="/forgot-password">
                Forgot password?
              </Link>
            </div>

            <button
              className="btn primary auth-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging In..." : "Log In"}
            </button>
          </form>

          <div className="auth-divider">
            <span>New to Achievement Hub?</span>
          </div>

          <Link
            className="auth-secondary-btn"
            to="/register"
          >
            Create an Account
          </Link>
        </section>
      </div>
    </main>
  );
}

export default Login;
