import { useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  CheckCircle2,
  Filter,
  Gamepad2,
  LockKeyhole,
  Search,
  Sparkles,
  Trophy
} from "lucide-react";

function Achievements() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [gameFilter, setGameFilter] = useState("All Games");

  const achievements = [
    {
      id: 1,
      title: "Elden Lord",
      game: "Elden Ring",
      description: "Achieve the Elden Lord ending.",
      rarity: "Legendary",
      status: "Unlocked",
      progress: 100,
      icon: Trophy
    },
    {
      id: 2,
      title: "Sharpshooter",
      game: "Counter-Strike 2",
      description: "Complete 100 precision eliminations.",
      rarity: "Rare",
      status: "Unlocked",
      progress: 100,
      icon: CheckCircle2
    },
    {
      id: 3,
      title: "Best in the West",
      game: "Red Dead Redemption 2",
      description: "Reach maximum completion in the western frontier.",
      rarity: "Epic",
      status: "Unlocked",
      progress: 100,
      icon: Sparkles
    },
    {
      id: 4,
      title: "Completionist",
      game: "Elden Ring",
      description: "Unlock every achievement in the game.",
      rarity: "Ultra Rare",
      status: "Locked",
      progress: 78,
      icon: LockKeyhole
    },
    {
      id: 5,
      title: "Night City Legend",
      game: "Cyberpunk 2077",
      description: "Complete every major mission in Night City.",
      rarity: "Legendary",
      status: "Locked",
      progress: 64,
      icon: LockKeyhole
    },
    {
      id: 6,
      title: "Master Witcher",
      game: "The Witcher 3",
      description: "Complete every Witcher contract.",
      rarity: "Epic",
      status: "Unlocked",
      progress: 100,
      icon: Trophy
    }
  ];

  const games = [
    "All Games",
    ...new Set(achievements.map((achievement) => achievement.game))
  ];

  const filteredAchievements = useMemo(() => {
    return achievements.filter((achievement) => {
      const matchesSearch =
        achievement.title.toLowerCase().includes(search.toLowerCase()) ||
        achievement.game.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        achievement.status === statusFilter;

      const matchesGame =
        gameFilter === "All Games" ||
        achievement.game === gameFilter;

      return matchesSearch && matchesStatus && matchesGame;
    });
  }, [search, statusFilter, gameFilter]);

  const unlockedCount = achievements.filter(
    (achievement) => achievement.status === "Unlocked"
  ).length;

  const lockedCount = achievements.length - unlockedCount;

  return (
    <main className="dashboard-page">
      <Sidebar />

      <section className="dashboard-content">
        <div className="achievements-heading-row">
          <div>
            <span className="dashboard-eyebrow">
              Achievement Collection
            </span>

            <h1>Achievements</h1>

            <p>
              Track unlocked and locked achievements across your Steam games.
            </p>
          </div>
        </div>

        <div className="achievement-summary-grid">
          <div className="achievement-summary-card">
            <Trophy />

            <div>
              <strong>{achievements.length}</strong>
              <span>Total Achievements</span>
            </div>
          </div>

          <div className="achievement-summary-card">
            <CheckCircle2 />

            <div>
              <strong>{unlockedCount}</strong>
              <span>Unlocked</span>
            </div>
          </div>

          <div className="achievement-summary-card">
            <LockKeyhole />

            <div>
              <strong>{lockedCount}</strong>
              <span>Locked</span>
            </div>
          </div>

          <div className="achievement-summary-card">
            <Sparkles />

            <div>
              <strong>
                {Math.round(
                  (unlockedCount / achievements.length) * 100
                )}%
              </strong>
              <span>Completion Rate</span>
            </div>
          </div>
        </div>

        <section className="achievement-toolbar">
          <div className="achievement-search-box">
            <Search size={20} />

            <input
              type="text"
              placeholder="Search achievements or games..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="achievement-filter-area">
            <Filter size={18} />

            <select
              value={gameFilter}
              onChange={(event) => setGameFilter(event.target.value)}
            >
              {games.map((game) => (
                <option key={game} value={game}>
                  {game}
                </option>
              ))}
            </select>

            <div className="achievement-status-buttons">
              {["All", "Unlocked", "Locked"].map((status) => (
                <button
                  key={status}
                  className={
                    statusFilter === status ? "active" : ""
                  }
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="achievement-results-row">
          Showing {filteredAchievements.length} of{" "}
          {achievements.length} achievements
        </div>

        {filteredAchievements.length > 0 ? (
          <div className="achievement-card-grid">
            {filteredAchievements.map((achievement) => {
              const Icon = achievement.icon;

              return (
                <article
                  className={`achievement-card ${
                    achievement.status === "Locked"
                      ? "locked"
                      : "unlocked"
                  }`}
                  key={achievement.id}
                >
                  <div className="achievement-card-top">
                    <div className="achievement-large-icon">
                      <Icon />
                    </div>

                    <div className="achievement-card-title">
                      <h2>{achievement.title}</h2>
                      <p>{achievement.game}</p>
                    </div>

                    <span
                      className={`achievement-status-badge ${
                        achievement.status === "Unlocked"
                          ? "unlocked"
                          : "locked"
                      }`}
                    >
                      {achievement.status}
                    </span>
                  </div>

                  <p className="achievement-description">
                    {achievement.description}
                  </p>

                  <div className="achievement-meta-row">
                    <span>Rarity</span>

                    <strong
                      className={`rarity-${achievement.rarity
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {achievement.rarity}
                    </strong>
                  </div>

                  <div className="achievement-progress-label">
                    <span>Progress</span>
                    <strong>{achievement.progress}%</strong>
                  </div>

                  <div className="achievement-progress-track">
                    <div
                      style={{
                        width: `${achievement.progress}%`
                      }}
                    ></div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="achievement-empty-state">
            <Gamepad2 />

            <h2>No achievements found</h2>

            <p>Try another search or filter.</p>
          </div>
        )}
      </section>
    </main>
  );
}

export default Achievements;
