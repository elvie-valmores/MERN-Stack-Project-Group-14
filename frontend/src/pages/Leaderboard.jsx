import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import Sidebar from "../components/Sidebar";
import PageLoading from "../components/PageLoading";

import {
  Crown,
  Medal,
  Search,
  Sparkles,
  Trophy
} from "lucide-react";

import {
  apiRequest,
  clearUser,
  getCurrentUser,
  getToken
} from "../services/api";

function Leaderboard() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [players, setPlayers] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    const loadLeaderboard = async () => {
      if (!getToken()) {
        clearUser();

        navigate("/login", {
          replace: true
        });

        return;
      }

      try {
        const data = await apiRequest(
          "/api/leaderboard"
        );

        setPlayers(
          data.leaderboard || []
        );
      } catch (error) {
        if (error.status === 401) {
          clearUser();

          navigate("/login", {
            replace: true
          });

          return;
        }

        setMessage(
          error.message ||
            "Could not load leaderboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [navigate]);

  const filteredPlayers = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return players;
    }

    return players.filter((player) =>
      player.name
        .toLowerCase()
        .includes(query)
    );
  }, [players, search]);

  const topThree =
    players.slice(0, 3);

  const totalXP = players.reduce(
    (total, player) =>
      total +
      (player.achievementXP || 0),
    0
  );

  const totalUnlocked = players.reduce(
    (total, player) =>
      total +
      (player.achievementsUnlocked || 0),
    0
  );

  const getRankIcon = (rank) => {
    if (rank === 1) {
      return <Crown />;
    }

    if (rank === 2 || rank === 3) {
      return <Medal />;
    }

    return <Trophy />;
  };

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "P"
    );
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
              See how registered players rank
              by achievement XP and completion.
            </p>
          </div>
        </div>

        {loading ? (
          <PageLoading message="Loading leaderboard..." />
        ) : (
          <>
            {message && (
              <div className="profile-page-message error">
                {message}
              </div>
            )}

            <div className="leaderboard-summary-grid">
              <div className="dash-card">
                <Trophy />

                <div>
                  <h3>{players.length}</h3>
                  <p>Ranked Players</p>
                </div>
              </div>

              <div className="dash-card">
                <Sparkles />

                <div>
                  <h3>
                    {totalXP.toLocaleString()}
                  </h3>

                  <p>Total XP Earned</p>
                </div>
              </div>

              <div className="dash-card">
                <Medal />

                <div>
                  <h3>
                    {totalUnlocked.toLocaleString()}
                  </h3>

                  <p>
                    Achievements Unlocked
                  </p>
                </div>
              </div>
            </div>

            {topThree.length > 0 && (
              <section className="leaderboard-podium">
                {topThree.map((player) => (
                  <article
                    className={`podium-card rank-${player.rank}`}
                    key={player._id}
                  >
                    <div className="podium-rank-icon">
                      {getRankIcon(
                        player.rank
                      )}
                    </div>

                    <span className="podium-rank">
                      #{player.rank}
                    </span>

                    {player.steamAvatar ? (
                      <img
                        className="podium-avatar"
                        src={player.steamAvatar}
                        alt={player.name}
                      />
                    ) : (
                      <div className="podium-avatar">
                        {getInitials(
                          player.name
                        )}
                      </div>
                    )}

                    <h2>{player.name}</h2>

                    <p>
                      Level {player.level || 1}
                    </p>

                    <strong>
                      {(
                        player.achievementXP || 0
                      ).toLocaleString()}{" "}
                      XP
                    </strong>

                    <div className="podium-meta">
                      <span>
                        {player.achievementsUnlocked ||
                          0}{" "}
                        unlocked
                      </span>

                      <span>
                        {player.completionPercentage ||
                          0}
                        % complete
                      </span>
                    </div>
                  </article>
                ))}
              </section>
            )}

            <section className="leaderboard-search-panel">
              <div className="leaderboard-search-box">
                <Search />

                <input
                  type="text"
                  placeholder="Search players..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                />
              </div>

              <span>
                All Time Rankings
              </span>
            </section>

            {filteredPlayers.length === 0 ? (
              <div className="leaderboard-empty-card">
                No players found.
              </div>
            ) : (
              <section className="leaderboard-table-card">
                <div className="leaderboard-table-header">
                  <span>Rank</span>
                  <span>Player</span>
                  <span>Achievements</span>
                  <span>Completion</span>
                  <span>Level</span>
                  <span>XP</span>
                </div>

                {filteredPlayers.map(
                  (player) => {
                    const isCurrentUser =
                      String(player._id) ===
                      String(
                        currentUser._id
                      );

                    return (
                      <div
                        className={`leaderboard-table-row ${
                          isCurrentUser
                            ? "current-player-row"
                            : ""
                        }`}
                        key={player._id}
                      >
                        <div className="leaderboard-rank-cell">
                          {getRankIcon(
                            player.rank
                          )}

                          <strong>
                            #{player.rank}
                          </strong>
                        </div>

                        <div className="leaderboard-player-cell">
                          {player.steamAvatar ? (
                            <img
                              src={
                                player.steamAvatar
                              }
                              alt={
                                player.name
                              }
                            />
                          ) : (
                            <div className="leaderboard-player-avatar">
                              {getInitials(
                                player.name
                              )}
                            </div>
                          )}

                          <div>
                            <strong>
                              {player.name}
                            </strong>

                            {isCurrentUser && (
                              <span className="leaderboard-you-badge">
                                You
                              </span>
                            )}
                          </div>
                        </div>

                        <strong>
                          {player.achievementsUnlocked ||
                            0}
                        </strong>

                        <div className="leaderboard-completion-cell">
                          <strong>
                            {player.completionPercentage ||
                              0}
                            %
                          </strong>

                          <div className="dashboard-progress">
                            <div
                              style={{
                                width: `${
                                  player.completionPercentage ||
                                  0
                                }%`
                              }}
                            ></div>
                          </div>
                        </div>

                        <strong>
                          {player.level || 1}
                        </strong>

                        <strong className="leaderboard-xp">
                          {(
                            player.achievementXP ||
                            0
                          ).toLocaleString()}{" "}
                          XP
                        </strong>
                      </div>
                    );
                  }
                )}
              </section>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default Leaderboard;
