import { Link } from "react-router-dom";
import {
  Gamepad2,
  Trophy,
  Users,
  Sparkles,
  ArrowRight,
  Search,
  ShieldCheck,
  BarChart3
} from "lucide-react";

import controllerImg from "../assets/images/controller.webp";
import achievementLogo from "../assets/images/223-cropped.webp";

function Home() {
  const storedUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const token =
    storedUser.token ||
    storedUser.user?.token;

  const scrollToFeatures = () => {
    document
      .getElementById("features")
      ?.scrollIntoView({
        behavior: "smooth"
      });
  };

  return (
    <main className="home-page">
      <nav className="navbar">
        <Link to="/" className="logo">
          <img
            src={achievementLogo}
            alt="Achievement Hub logo"
            className="brand-logo-image"
          />

          <span>
            Achievement <b>Hub</b>
          </span>
        </Link>

        <div className="nav-links">
          <Link className="active" to="/">
            Home
          </Link>

          <Link to="/my-games">
            My Games
          </Link>

          <Link to="/achievements">
            Achievements
          </Link>

          <Link to="/leaderboard">
            Leaderboard
          </Link>
        </div>

        <div className="nav-buttons">
          {token ? (
            <Link
              className="btn primary"
              to="/dashboard"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                className="btn ghost"
                to="/login"
              >
                Log In
              </Link>

              <Link
                className="btn primary"
                to="/register"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="hero">
        <div className="hero-text">
          <p className="tagline">
            Steam Achievement Tracker
          </p>

          <h1>
            Track Your Games.
            <br />
            Unlock <span>Your Story.</span>
          </h1>

          <p className="hero-description">
            Connect your Steam account, import your
            games, and showcase your achievement
            progress in one clean dashboard.
          </p>

          <div className="hero-buttons">
            <Link
              className="btn primary big"
              to={
                token
                  ? "/dashboard"
                  : "/register"
              }
            >
              {token
                ? "Go to Dashboard"
                : "Get Started"}

              <ArrowRight size={22} />
            </Link>

            <button
              className="btn ghost big"
              onClick={scrollToFeatures}
            >
              Learn More
            </button>
          </div>
        </div>

        <div className="hero-image">
          <div className="portal"></div>

          <img
              src={controllerImg}
              alt="Glowing gaming controller"
              fetchPriority="high"
              decoding="async"
          />
        </div>
      </section>

      <section className="stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Users />
          </div>

          <div>
            <h3>12,540</h3>
            <p>Users</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Gamepad2 />
          </div>

          <div>
            <h3>8,230</h3>
            <p>Games Tracked</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Trophy />
          </div>

          <div>
            <h3>125,000+</h3>
            <p>Achievements</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Sparkles />
          </div>

          <div>
            <h3>98,760</h3>
            <p>Unlocked</p>
          </div>
        </div>
      </section>

      <section
        className="features"
        id="features"
      >
        <div className="section-heading">
          <p>Built for Steam players</p>

          <h2>
            Everything you need to track your
            progress.
          </h2>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <Search />

            <h3>Import Steam Games</h3>

            <p>
              Connect your Steam profile and bring
              your game library into one clean
              dashboard.
            </p>
          </div>

          <div className="feature-card">
            <Trophy />

            <h3>Track Achievements</h3>

            <p>
              View locked and unlocked achievements,
              completion rates, and recent progress.
            </p>
          </div>

          <div className="feature-card">
            <BarChart3 />

            <h3>Progress Dashboard</h3>

            <p>
              See your total games, unlocked
              achievements, and overall completion
              percentage.
            </p>
          </div>

          <div className="feature-card">
            <ShieldCheck />

            <h3>Secure Account</h3>

            <p>
              Your profile data is protected with
              login authentication and MongoDB
              storage.
            </p>
          </div>
        </div>
      </section>

      <section className="games-preview">
        <div className="section-heading">
          <p>Featured Games</p>

          <h2>Start Your Journey</h2>
        </div>

        <div className="game-grid">
          <div className="game-card">
            <img
              src="https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/730/header.jpg"
              alt="Counter-Strike 2"
            />

            <div className="game-info">
              <h3>Counter-Strike 2</h3>

              <span>
                Connect Steam to track your progress
              </span>
            </div>
          </div>

          <div className="game-card">
            <img
              src="https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg"
              alt="Red Dead Redemption 2"
            />

            <div className="game-info">
              <h3>
                Red Dead Redemption 2
              </h3>

              <span>
                Connect Steam to track your progress
              </span>
            </div>
          </div>

          <div className="game-card">
            <img
              src="https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg"
              alt="Elden Ring"
            />

            <div className="game-info">
              <h3>Elden Ring</h3>

              <span>
                Connect Steam to track your progress
              </span>
            </div>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="footer-logo">
          <img
            src={achievementLogo}
            alt="Achievement Hub logo"
            className="footer-logo-image"
          />

          <span>
            Achievement <b>Hub</b>
          </span>
        </div>

        <p>
          Track your Steam games, achievements,
          and progress in one place.
        </p>

        <div className="footer-links">
          <Link to="/about">
            About Us
          </Link>

          <Link to="/connect-steam">
            Connect Steam
          </Link>

          <Link to="/privacy">
            Privacy
          </Link>

          <Link to="/terms">
            Terms
          </Link>

          <Link to="/help">
            Help
          </Link>

          <Link to="/contact">
            Contact
          </Link>
        </div>

        <small>
          © 2026 Achievement Hub
        </small>
      </footer>
    </main>
  );
}

export default Home;
