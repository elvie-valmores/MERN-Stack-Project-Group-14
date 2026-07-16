import { Link, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  ArrowLeft,
  Clock3,
  Gamepad2,
  Sparkles,
  Trophy
} from "lucide-react";

const games = {
  "counter-strike-2": {
    name: "Counter-Strike 2",
    image:
      "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/730/header.jpg",
    progress: 87,
    achievements: 142,
    unlocked: 124,
    hours: 425,
    description:
      "A competitive tactical shooter with team-based matches and achievement tracking."
  },

  "red-dead-redemption-2": {
    name: "Red Dead Redemption 2",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg",
    progress: 61,
    achievements: 51,
    unlocked: 31,
    hours: 298,
    description:
      "Explore an open-world western adventure and track your achievement completion."
  },

  "elden-ring": {
    name: "Elden Ring",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg",
    progress: 42,
    achievements: 42,
    unlocked: 18,
    hours: 186,
    description:
      "Explore the Lands Between and track your progress toward every achievement."
  },

  "grand-theft-auto-v": {
    name: "Grand Theft Auto V",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg",
    progress: 100,
    achievements: 77,
    unlocked: 77,
    hours: 522,
    description:
      "A completed open-world action game with all achievements unlocked."
  },

  "cyberpunk-2077": {
    name: "Cyberpunk 2077",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg",
    progress: 73,
    achievements: 57,
    unlocked: 42,
    hours: 214,
    description:
      "Explore Night City and continue unlocking achievements throughout the story."
  },

  "the-witcher-3": {
    name: "The Witcher 3",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg",
    progress: 100,
    achievements: 78,
    unlocked: 78,
    hours: 386,
    description:
      "A completed fantasy adventure with every achievement unlocked."
  }
};

function GameDetails() {
  const { gameId } = useParams();
  const game = games[gameId];

  if (!game) {
    return (
      <main className="dashboard-page">
        <Sidebar />

        <section className="dashboard-content game-not-found">
          <Gamepad2 />
          <h1>Game Not Found</h1>
          <p>The selected game does not exist.</p>

          <Link to="/my-games">
            Back to My Games
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <Sidebar />

      <section className="dashboard-content">
        <Link to="/my-games" className="game-back-link">
          <ArrowLeft size={18} />
          Back to My Games
        </Link>

        <section className="game-details-hero">
          <img src={game.image} alt={game.name} />

          <div className="game-details-overlay"></div>

          <div className="game-details-title">
            <span>Game Overview</span>
            <h1>{game.name}</h1>
            <p>{game.description}</p>
          </div>
        </section>

        <div className="game-details-stats">
          <div>
            <Clock3 />
            <strong>{game.hours}</strong>
            <span>Hours Played</span>
          </div>

          <div>
            <Trophy />
            <strong>{game.achievements}</strong>
            <span>Total Achievements</span>
          </div>

          <div>
            <Sparkles />
            <strong>{game.unlocked}</strong>
            <span>Unlocked</span>
          </div>

          <div>
            <Gamepad2 />
            <strong>{game.progress}%</strong>
            <span>Completion</span>
          </div>
        </div>

        <section className="game-progress-panel">
          <div className="panel-header">
            <div>
              <span className="panel-eyebrow">
                Achievement Progress
              </span>

              <h2>Your Completion</h2>
            </div>

            <strong>{game.progress}%</strong>
          </div>

          <div className="game-details-progress">
            <div style={{ width: `${game.progress}%` }}></div>
          </div>

          <p>
            You have unlocked {game.unlocked} of {game.achievements} achievements.
          </p>
        </section>
      </section>
    </main>
  );
}

export default GameDetails;
