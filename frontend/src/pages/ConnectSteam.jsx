import { Link } from "react-router-dom";
import {
  Gamepad2,
  Library,
  ShieldCheck,
  Trophy
} from "lucide-react";
import InfoPageLayout from "../components/InfoPageLayout";

function ConnectSteam() {
  const storedUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const token =
    storedUser.token ||
    storedUser.user?.token;

  return (
    <InfoPageLayout
      eyebrow="Steam Integration"
      title="Connect your Steam account."
      description="Import your public Steam profile, library, playtime, and achievement progress into Achievement Hub."
    >
      <div className="info-card-grid">
        <article className="info-card">
          <Library />
          <h2>Import your library</h2>
          <p>
            Add your owned Steam games automatically
            instead of entering them manually.
          </p>
        </article>

        <article className="info-card">
          <Trophy />
          <h2>Track achievements</h2>
          <p>
            View unlocked achievements and completion
            progress for supported Steam games.
          </p>
        </article>

        <article className="info-card">
          <Gamepad2 />
          <h2>View playtime</h2>
          <p>
            Display the hours you have played across
            your Steam library.
          </p>
        </article>

        <article className="info-card">
          <ShieldCheck />
          <h2>Public data only</h2>
          <p>
            Achievement Hub never stores your Steam password.
            Only your public Steam ID is used.
          </p>
        </article>
      </div>

      <div className="info-action-card">
        <h2>Ready to connect?</h2>

        <p>
          Your Steam profile and game details must be public
          for the import to work.
        </p>

        <Link
          className="info-primary-button"
          to={token ? "/profile" : "/login"}
        >
          {token
            ? "Go to Profile"
            : "Log In to Continue"}
        </Link>
      </div>
    </InfoPageLayout>
  );
}

export default ConnectSteam;
