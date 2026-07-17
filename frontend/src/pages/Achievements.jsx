import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  LockKeyhole,
  Sparkles,
  Trophy
} from "lucide-react";

function Achievements() {
  return (
    <main className="dashboard-page">
      <Sidebar />

      <section className="dashboard-content">
        <div className="dashboard-heading-row">
          <div>
            <span className="dashboard-eyebrow">
              Achievement Collection
            </span>

            <h1>Achievements</h1>

            <p>
              Your unlocked and locked Steam achievements
              will appear here.
            </p>
          </div>
        </div>

        <section className="empty-data-card">
          <div className="empty-data-icon">
            <Trophy />
          </div>

          <span className="panel-eyebrow">
            No achievements imported
          </span>

          <h2>Start tracking your progress</h2>

          <p>
            Connect Steam to import achievements and calculate
            completion percentage, XP, and level.
          </p>

          <Link
            className="info-primary-button"
            to="/profile"
          >
            <Sparkles size={18} />
            Connect Steam
          </Link>
        </section>

        <section className="empty-info-grid">
          <article>
            <Trophy />
            <h3>Unlocked</h3>
            <p>
              See achievements you have already completed.
            </p>
          </article>

          <article>
            <LockKeyhole />
            <h3>Locked</h3>
            <p>
              Track remaining achievements for each game.
            </p>
          </article>

          <article>
            <Sparkles />
            <h3>Achievement XP</h3>
            <p>
              Earn Achievement Hub XP as you unlock more.
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}

export default Achievements;
