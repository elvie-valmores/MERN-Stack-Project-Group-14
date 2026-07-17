import {
  Gamepad2,
  Sparkles,
  Trophy,
  Users
} from "lucide-react";
import InfoPageLayout from "../components/InfoPageLayout";

function About() {
  return (
    <InfoPageLayout
      eyebrow="About Achievement Hub"
      title="Track more than games."
      description="Achievement Hub helps players organize their Steam progress, achievements, and gaming milestones in one place."
    >
      <div className="info-card-grid">
        <article className="info-card">
          <Gamepad2 />
          <h2>Your game library</h2>
          <p>
            View your connected Steam games, playtime,
            completion progress, and recent activity.
          </p>
        </article>

        <article className="info-card">
          <Trophy />
          <h2>Achievement tracking</h2>
          <p>
            Keep track of unlocked and locked achievements
            across your favorite games.
          </p>
        </article>

        <article className="info-card">
          <Sparkles />
          <h2>Progress and XP</h2>
          <p>
            Turn your gaming progress into completion stats,
            levels, and achievement XP.
          </p>
        </article>

        <article className="info-card">
          <Users />
          <h2>Player rankings</h2>
          <p>
            Compare progress with other registered players
            through the Achievement Hub leaderboard.
          </p>
        </article>
      </div>
    </InfoPageLayout>
  );
}

export default About;
