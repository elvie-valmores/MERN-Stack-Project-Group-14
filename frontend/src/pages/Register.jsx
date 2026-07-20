import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Trophy,
  User,
} from "lucide-react";

import achievementLogo from "../assets/images/223-cropped.png";
import GoogleSignInButton from "../components/GoogleSignInButton";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5050"
).replace(/\/$/, "");

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });

    setMessage("");
    setMessageType("");
  };

  const validateForm = () => {
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setMessage("Please complete all fields.");
      setMessageType("error");
      return false;
    }

    if (!formData.email.includes("@")) {
      setMessage(
        "Please enter a valid email address."
      );
      setMessageType("error");
      return false;
    }

    if (formData.password.length < 8) {
      setMessage(
        "Password must be at least 8 characters."
      );
      setMessageType("error");
      return false;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setMessage("Passwords do not match.");
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
    setMessageType("");

    try {
      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email
              .trim()
              .toLowerCase(),
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Registration failed."
        );
        setMessageType("error");
        return;
      }

      setMessage(
        data.message ||
          "Account created. Please check your email to verify your account."
      );

      setMessageType("success");

      const registeredEmail =
        formData.email.trim().toLowerCase();

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login", {
          state: {
            registeredEmail,
            verificationMessage:
              data.message ||
              "Account created. Please check your email to verify your account.",
          },
        });
      }, 1800);
    } catch (error) {
      setMessage(
        "Cannot connect to the server. Please try again later."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-split-page">
      <Link
        to="/"
        className="auth-back-link login-back-link"
      >
        <ArrowLeft size={18} />
        Back to Home
      </Link>

      <div className="login-split-card register-split-card">
        <section className="login-showcase">
          <Link
            to="/"
            className="login-showcase-logo"
          >
            <img
              src={achievementLogo}
              alt="Achievement Hub"
            />
          </Link>

          <div className="login-showcase-content">
            <span className="login-eyebrow">
              Join Achievement Hub
            </span>

            <h1>
              Start your
              <span> gaming journey.</span>
            </h1>

            <p>
              Create your account to track games,
              unlock achievements, and build your
              gaming profile.
            </p>

            <div className="login-benefits">
              <div>
                <CheckCircle2 />

                <span>
                  Track your Steam library
                </span>
              </div>

              <div>
                <Trophy />

                <span>
                  Monitor achievement progress
                </span>
              </div>

              <div>
                <ShieldCheck />

                <span>
                  Keep your account secure
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="login-form-side register-form-side">
          <div className="login-form-heading">
            <h2>Create Account</h2>

            <p>
              Enter your details to get started.
            </p>
          </div>

          {message && (
            <div
              className={`auth-message ${messageType}`}
              role="status"
              aria-live="polite"
            >
              {message}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
          >
            <label htmlFor="register-name">
              Full Name
            </label>

            <div className="auth-input-group">
              <User size={20} />

              <input
                id="register-name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <label htmlFor="register-email">
              Email Address
            </label>

            <div className="auth-input-group">
              <Mail size={20} />

              <input
                id="register-email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <label htmlFor="register-password">
              Password
            </label>

            <div className="auth-input-group">
              <LockKeyhole size={20} />

              <input
                id="register-password"
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Create a password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            <label htmlFor="register-confirm-password">
              Confirm Password
            </label>

            <div className="auth-input-group">
              <LockKeyhole size={20} />

              <input
                id="register-confirm-password"
                name="confirmPassword"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm your password"
                autoComplete="new-password"
                value={
                  formData.confirmPassword
                }
                onChange={handleChange}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            <button
              className="btn primary auth-btn"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>
          </form>

          <GoogleSignInButton
            setMessage={setMessage}
            setMessageType={setMessageType}
          />

          <div className="auth-divider">
            <span>
              Already have an account?
            </span>
          </div>

          <Link
            className="auth-secondary-btn"
            to="/login"
          >
            Log In
          </Link>
        </section>
      </div>
    </main>
  );
}

export default Register;
