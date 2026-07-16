import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  BarChart3,
  Clock3,
  Gamepad2,
  Link2,
  Sparkles,
  Trophy
} from "lucide-react";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  const recentGames = [
    {
      name: "Elden Ring",
      image:
        "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg",
      progress: 42,
      hours: 186
    },
    {
      name: "Counter-Strike 2",
      image:
        "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/730/header.jpg",
      progress: 87,
      hours: 425
    },
    {
      name: "Red Dead Redemption 2",
      image:
        "https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg",
      progress: 61,
      hours: 298
    }
  ];

  const recentAchievements = [
    {
      title: "Elden Lord",
      game: "Elden Ring",
      time: "Unlocked today",
      icon: Trophy
    },
    {
      title: "Sharpshooter",
      game: "Counter-Strike 2",
      time: "Unlocked yesterday",
      icon: Sparkles
    },
    {
      title: "Best in the West",
      game: "Red Dead Redemption 2",
      time: "Unlocked 3 days ago",
      icon: Trophy
    }
  ];

  return (
    <main className="dashboard-page">
      <Sidebar />

      <section className="dashboard-content">
        <div className="dashboard-heading-row">
          <div>
            <span className="dashboard-eyebrow">Player Dashboard</span>

            <h1>
              Welcome back, {user?.name || "Player"} 👋
            </h1>

            <p>
              Track your games, achievements, and overall Steam progress.
            </p>
          </div>

          <Link className="dashboard-steam-btn" to="/profile">
            <Link2 size={19} />
            Connect Steam
          </Link>
        </div>

        <div className="dashboard-stats">
          <div className="dash-card">
            <Gamepad2 />

            <div>
              <h3>24</h3>
              <p>Games Tracked</p>
            </div>
          </div>

          <div className="dash-card">
            <Trophy />

            <div>
              <h3>312</h3>
              <p>Total Achievements</p>
            </div>
          </div>

          <div className="dash-card">
            <Sparkles />

            <div>
              <h3>184</h3>
              <p>Achievements Unlocked</p>
            </div>
          </div>

          <div className="dash-card">
            <BarChart3 />

          <div>
              <h3>59%</h3>
              <p>Overall Completion</p>
            </div>
          </div>
        </div>

        <div className="dashboard-main-grid">
          <section className="dashboard-panel recent-games-panel">
            <div className="panel-header">
              <div>
                <span className="panel-eyebrow">
                  Your Library
                </span>

                <h2>Recent Games</h2>
              </div>

              <Link to="/my-games">
                View All
              </Link>
            </div>

            <div className="dashboard-game-list">
              {recentGames.map((game) => (
                <div className="dashboard-game-row" key={game.name}>
                  <img src={game.image} alt={game.name} />

                  <div className="dashboard-game-info">
                    <h3>{game.name}</h3>

                    <div className="dashboard-game-meta">
                      <span>{game.progress}% completed</span>

                      <span>
                        <Clock3 size={15} />
                        {game.hours} hours
                      </span>
                    </div>

                    <div className="dashboard-progress">
                      <div
                        style={{ width: `${game.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="dashboard-panel recent-achievements-panel">
            <div className="panel-header">
              <div>
                <span className="panel-eyebrow">
                  Latest Unlocks
                </span>

                <h2>Recent Achievements</h2>
              </div>

              <Link to="/achievements">
                View All
              </Link>
            </div>

            <div className="dashboard-achievement-list">
              {recentAchievements.map((achievement) => {
                const Icon = achievement.icon;

                return (
                  <div
                    className="dashboard-achievement-row"
                    key={achievement.title}
                  >
                    <div className="dashboard-achievement-icon">
                      <Icon />
                    </div>

                    <div>
                      <h3>{achievement.title}</h3>

                      <p>{achievement.game}</p>

                      <span>{achievement.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <section className="steam-connect-panel">
          <div className="steam-connect-icon">
            <Gamepad2 />
          </div>

          <div>
            <span>Steam Integration</span>

            <h2>Connect your Steam profile</h2>

            <p>
              Import your games, playtime, and achievements automatically.
            </p>
          </div>

          <Link to="/profile">
            Connect Steam
          </Link>
        </section>
      </section>
    </main>
  );
}

export default Dashboard;
