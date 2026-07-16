import { useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  Award,
  Crown,
  Medal,
  Search,
  Sparkles,
  Trophy
} from "lucide-react";

function Leaderboard() {
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("All Time");

  const players = [
    {
      id: 1,
      name: "Alex",
      initials: "A",
      title: "Legend",
      xp: 9820,
      achievements: 246,
      completion: 91,
      change: "+320 XP"
    },
    {
      id: 2,
      name: "Moaaz",
      initials: "M",
      title: "Elite",
      xp: 9440,
      achievements: 231,
      completion: 88,
      change: "+280 XP",
      currentUser: true
    },
    {
      id: 3,
      name: "Sarah",
      initials: "S",
      title: "Pro",
      xp: 9130,
      achievements: 219,
      completion: 84,
      change: "+245 XP"
    },
    {
      id: 4,
      name: "James",
      initials: "J",
      title: "Hunter",
      xp: 8750,
      achievements: 205,
      completion: 80,
      change: "+210 XP"
    },
    {
      id: 5,
      name: "Layla",
      initials: "L",
      title: "Explorer",
      xp: 8420,
      achievements: 194,
      completion: 76,
      change: "+190 XP"
    },
    {
      id: 6,
      name: "Daniel",
      initials: "D",
      title: "Challenger",
      xp: 8010,
      achievements: 182,
      completion: 73,
      change: "+165 XP"
    },
    {
      id: 7,
      name: "Emma",
      initials: "E",
      title: "Rising Star",
      xp: 7640,
      achievements: 171,
      completion: 69,
      change: "+150 XP"
    }
  ];

  const filteredPlayers = useMemo(() => {
    return players.filter((player) =>
      player.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const topThree = players.slice(0, 3);

  const rankIcon = (rank) => {
    if (rank === 1) return <Crown />;
    if (rank === 2) return <Medal />;
    if (rank === 3) return <Award />;
    return <Trophy />;
  };

  return (
    <main className="dashboard-page">
      <Sidebar />

      <section className="dashboard-content">
        <div className="leaderboard-heading-row">
          <div>
            <span className="dashboard-eyebrow">
              Global Rankings
            </span>

            <h1>Leaderboard</h1>

            <p>
              See how players rank based on achievement points and completion.
            </p>
          </div>

          <div className="leaderboard-period">
            {["Weekly", "All Time"].map((option) => (
              <button
                key={option}
                className={period === option ? "active" : ""}
                onClick={() => setPeriod(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <section className="leaderboard-summary">
          <div>
            <Trophy />
            <strong>{players.length}</strong>
            <span>Ranked Players</span>
          </div>

          <div>
            <Sparkles />
            <strong>61,210</strong>
            <span>Total XP Earned</span>
          </div>

          <div>
            <Award />
            <strong>1,448</strong>
            <span>Achievements Unlocked</span>
          </div>
        </section>

        <section className="leaderboard-podium">
          {topThree.map((player, index) => {
            const rank = index + 1;

            return (
              <article
                className={`podium-card rank-${rank}`}
                key={player.id}
              >
                <div className="podium-rank-icon">
                  {rankIcon(rank)}
                </div>

                <span className="podium-position">
                  #{rank}
                </span>

                <div className="player-avatar">
                  {player.initials}
                </div>

                <h2>{player.name}</h2>
                <p>{player.title}</p>

                <strong>{player.xp.toLocaleString()} XP</strong>

                <div className="podium-player-stats">
                  <span>{player.achievements} achievements</span>
                  <span>{player.completion}% complete</span>
                </div>
              </article>
            );
          })}
        </section>

        <section className="leaderboard-toolbar">
          <div className="leaderboard-search">
            <Search size={20} />

            <input
              type="text"
              placeholder="Search players..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <span>
            {period} Rankings
          </span>
        </section>

        <section className="leaderboard-table-card">
          <div className="leaderboard-table-header">
            <span>Rank</span>
            <span>Player</span>
            <span>Achievements</span>
            <span>Completion</span>
            <span>Recent Gain</span>
            <span>XP</span>
          </div>

          <div className="leaderboard-list">
            {filteredPlayers.map((player, index) => (
              <div
                className={`leaderboard-player-row ${
                  player.currentUser ? "current-user" : ""
                }`}
                key={player.id}
              >
                <div className="leaderboard-rank">
                  {rankIcon(index + 1)}
                  <strong>#{index + 1}</strong>
                </div>

                <div className="leaderboard-player">
                  <div className="leaderboard-avatar">
                    {player.initials}
                  </div>

                  <div>
                    <h3>
                      {player.name}
                      {player.currentUser && (
                        <span>You</span>
                      )}
                    </h3>

                    <p>{player.title}</p>
                  </div>
                </div>

                <strong className="leaderboard-value">
                  {player.achievements}
                </strong>

                <div className="leaderboard-completion">
                  <strong>{player.completion}%</strong>

                  <div>
                    <span
                      style={{
                        width: `${player.completion}%`
                      }}
                    ></span>
                  </div>
                </div>

                <span className="leaderboard-change">
                  {player.change}
                </span>

                <strong className="leaderboard-xp">
                  {player.xp.toLocaleString()} XP
                </strong>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

export default Leaderboard;
