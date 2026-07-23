import { Link } from "react-router-dom";
import achievementLogo from "../assets/images/223-cropped-optimized.webp";

function InfoPageLayout({
  eyebrow,
  title,
  description,
  children
}) {
  return (
    <main className="info-page">
      <div className="info-page-shell">
        <Link to="/" className="info-back-link">
          ← Back to Home
        </Link>

        <section className="info-page-hero">
          <img
            src={achievementLogo}
            alt="Achievement Hub"
            className="info-page-logo"
          />

          <div>
            <span className="dashboard-eyebrow">
              {eyebrow}
            </span>

            <h1>{title}</h1>

            <p>{description}</p>
          </div>
        </section>

        <section className="info-page-content">
          {children}
        </section>

        <footer className="info-page-footer">
          © 2026 Achievement Hub
        </footer>
      </div>
    </main>
  );
}

export default InfoPageLayout;
