import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  Gamepad2,
  Library,
  Link2
} from "lucide-react";

function MyGames() {
  return (
    <main className="dashboard-page">
      <Sidebar />

      <section className="dashboard-content">
        <div className="dashboard-heading-row">
          <div>
            <span className="dashboard-eyebrow">
              Your Steam Library
            </span>

            <h1>My Games</h1>

            <p>
              Your imported Steam games will appear here.
            </p>
          </div>
        </div>

        <section className="empty-data-card">
          <div className="empty-data-icon">
            <Library />
          </div>

          <span className="panel-eyebrow">
            No games imported
          </span>

          <h2>Connect your Steam account</h2>

          <p>
            Add your public Steam ID to import your game
            library, playtime, and completion progress.
          </p>

          <Link
            className="info-primary-button"
            to="/profile"
          >
            <Link2 size={18} />
            Connect Steam
          </Link>
        </section>

        <section className="empty-info-grid">
          <article>
            <Gamepad2 />
            <h3>Game Library</h3>
            <p>
              View all imported Steam games in one place.
            </p>
          </article>

          <article>
            <Library />
            <h3>Playtime</h3>
            <p>
              Compare total hours played across your library.
            </p>
          </article>

          <article>
            <Link2 />
            <h3>Automatic Updates</h3>
            <p>
              Steam synchronization will refresh your data.
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}

export default MyGames;
