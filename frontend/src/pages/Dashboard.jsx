import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import {
  BarChart3,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Gamepad2,
  Link2,
  LockKeyhole,
  RefreshCw,
  Sparkles,
  Trophy
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import PageLoading from "../components/PageLoading";

import {
  apiRequest,
  clearUser,
  getCurrentUser,
  getToken,
  saveUser
} from "../services/api";

import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(
    getCurrentUser()
  );

  const [games, setGames] =
    useState([]);

  const [achievements, setAchievements] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [syncing, setSyncing] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("");

  const [totalPlaytimeHours, setTotalPlaytimeHours] =
    useState(0);

  const [lastSyncedAt, setLastSyncedAt] =
    useState(null);

  const showMessage = (
    text,
    type = "success"
  ) => {
    setMessage(text);
    setMessageType(type);
  };

  const handleUnauthorized = () => {
    clearUser();

    navigate("/login", {
      replace: true
    });
  };

  const loadProfile = async () => {
    const token = getToken();

    const data = await apiRequest(
      "/api/auth/profile"
    );

    const updatedUser =
      saveUser(data, token);

    setUser(updatedUser);

    return updatedUser;
  };

  const loadGames = async () => {
    const data = await apiRequest(
      "/api/steam/games"
    );

    setGames(
      data.games || []
    );

    setTotalPlaytimeHours(
      data.totalPlaytimeHours || 0
    );

    setLastSyncedAt(
      data.lastSyncedAt || null
    );

    return data;
  };

  const loadAchievements = async () => {
    const data = await apiRequest(
      "/api/achievements"
    );

    setAchievements(
      data.achievements || []
    );

    return data;
  };

  const loadDashboard = async () => {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      await Promise.all([
        loadProfile(),
        loadGames(),
        loadAchievements()
      ]);
    } catch (error) {
      if (error.status === 401) {
        handleUnauthorized();
        return;
      }

      showMessage(
        error.message ||
          "Could not load the dashboard.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleSyncEverything = async () => {
    if (!user.steamId) {
      showMessage(
        "Connect your Steam account first.",
        "error"
      );

      return;
    }

    setSyncing(true);
    setMessage("");
    setMessageType("");

    try {
      const gameData = await apiRequest(
        "/api/steam/games/sync",
        {
          method: "POST"
        }
      );

      const achievementData =
        await apiRequest(
          "/api/achievements/sync",
          {
            method: "POST"
          }
        );

      await Promise.all([
        loadProfile(),
        loadGames(),
        loadAchievements()
      ]);

      const gameCount =
        gameData.gameCount || 0;

      const supportedGames =
        achievementData.supportedGames || 0;

      showMessage(
        `${gameCount} games synchronized. Achievement data was found for ${supportedGames} games.`
      );
    } catch (error) {
      if (error.status === 401) {
        handleUnauthorized();
        return;
      }

      showMessage(
        error.message ||
          "Could not synchronize Steam data.",
        "error"
      );
    } finally {
      setSyncing(false);
    }
  };

  const recentGames = useMemo(() => {
    return [...games]
      .sort((first, second) => {
        const firstDate =
          first.lastPlayedAt
            ? new Date(
                first.lastPlayedAt
              ).getTime()
            : 0;

        const secondDate =
          second.lastPlayedAt
            ? new Date(
                second.lastPlayedAt
              ).getTime()
            : 0;

        return secondDate - firstDate;
      })
      .slice(0, 4);
  }, [games]);

  const recentAchievements =
    useMemo(() => {
      return achievements
        .filter(
          (achievement) =>
            achievement.achieved
        )
        .sort((first, second) => {
          const firstDate =
            first.unlockTime
              ? new Date(
                  first.unlockTime
                ).getTime()
              : 0;

          const secondDate =
            second.unlockTime
              ? new Date(
                  second.unlockTime
                ).getTime()
              : 0;

          return secondDate - firstDate;
        })
        .slice(0, 5);
    }, [achievements]);

  const mostPlayedGames = useMemo(() => {
    return [...games]
      .sort(
        (first, second) =>
          (second.playtimeForever || 0) -
          (first.playtimeForever || 0)
      )
      .slice(0, 4);
  }, [games]);

  const formatDate = (date) => {
    if (!date) {
      return "Not synchronized yet";
    }

    return new Date(
      date
    ).toLocaleString(
      undefined,
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      }
    );
  };

  const formatUnlockDate = (date) => {
    if (!date) {
      return "Recently unlocked";
    }

    return new Date(
      date
    ).toLocaleDateString(
      undefined,
      {
        month: "short",
        day: "numeric",
        year: "numeric"
      }
    );
  };

  if (loading) {
    return (
      <main className="dashboard-page">
        <Sidebar />

        <section className="dashboard-content">
          <PageLoading message="Loading your dashboard..." />
        </section>
      </main>
    );
  }

  const steamConnected =
    Boolean(user.steamId);

  const gamesTracked =
    user.gamesTracked ||
    games.length ||
    0;

  const totalAchievements =
    user.totalAchievements ||
    achievements.length ||
    0;

  const achievementsUnlocked =
    user.achievementsUnlocked ||
    achievements.filter(
      (achievement) =>
        achievement.achieved
    ).length ||
    0;

  const achievementXP =
    user.achievementXP || 0;

  const level =
    user.level || 1;

  const completionPercentage =
    user.completionPercentage || 0;

  const lockedAchievements =
    Math.max(
      0,
      totalAchievements -
        achievementsUnlocked
    );

  return (
    <main className="dashboard-page">
      <Sidebar />

      <section className="dashboard-content">
        <div className="live-dashboard-heading">
          <div>
            <span className="dashboard-eyebrow">
              Player Dashboard
            </span>

            <h1>
              Welcome back,{" "}
              {user.name || "Player"} 👋
            </h1>

            <p>
              Track your Steam games,
              achievements, playtime, XP,
              and overall completion.
            </p>
          </div>

          <div className="dashboard-heading-actions">
            {steamConnected ? (
              <button
                className="dashboard-sync-all-button"
                type="button"
                onClick={handleSyncEverything}
                disabled={syncing}
              >
                <RefreshCw
                  size={18}
                  className={
                    syncing
                      ? "dashboard-sync-spin"
                      : ""
                  }
                />

                {syncing
                  ? "Synchronizing..."
                  : "Sync Everything"}
              </button>
            ) : (
              <Link
                className="dashboard-connect-button"
                to="/profile"
              >
                <Link2 size={18} />
                Connect Steam
              </Link>
            )}
          </div>
        </div>

        {message && (
          <div
            className={`profile-page-message ${messageType}`}
          >
            {message}
          </div>
        )}

        {steamConnected && (
          <section className="dashboard-steam-status">
            <div className="dashboard-steam-user">
              {user.steamAvatarFull ||
              user.steamAvatar ? (
                <img
                  src={
                    user.steamAvatarFull ||
                    user.steamAvatar
                  }
                  alt={
                    user.steamName ||
                    "Steam avatar"
                  }
                />
              ) : (
                <div className="dashboard-steam-avatar-fallback">
                  <Gamepad2 />
                </div>
              )}

              <div>
                <span>
                  Steam account connected
                </span>

                <h2>
                  {user.steamName ||
                    "Steam Player"}
                </h2>

                <p>
                  Steam ID: {user.steamId}
                </p>
              </div>
            </div>

            <div className="dashboard-sync-status">
              <CheckCircle2 />

              <div>
                <strong>
                  Last synchronized
                </strong>

                <span>
                  {formatDate(
                    lastSyncedAt ||
                      user.steamLastSyncedAt
                  )}
                </span>
              </div>
            </div>
          </section>
        )}

        <section className="dashboard-live-stats">
          <article>
            <div className="dashboard-stat-icon">
              <Gamepad2 />
            </div>

            <div>
              <strong>
                {gamesTracked}
              </strong>

              <span>
                Games Tracked
              </span>
            </div>
          </article>

          <article>
            <div className="dashboard-stat-icon">
              <Trophy />
            </div>

            <div>
              <strong>
                {achievementsUnlocked}
              </strong>

              <span>
                Achievements Unlocked
              </span>
            </div>
          </article>

          <article>
            <div className="dashboard-stat-icon">
              <Sparkles />
            </div>

            <div>
              <strong>
                {achievementXP.toLocaleString()}
              </strong>

              <span>
                Achievement XP
              </span>
            </div>
          </article>

          <article>
            <div className="dashboard-stat-icon">
              <BarChart3 />
            </div>

            <div>
              <strong>
                {completionPercentage}%
              </strong>

              <span>
                Overall Completion
              </span>
            </div>
          </article>
        </section>

        {!steamConnected ? (
          <section className="empty-data-card dashboard-empty-state">
            <div className="empty-data-icon">
              <Gamepad2 />
            </div>

            <span className="panel-eyebrow">
              Steam is not connected
            </span>

            <h2>
              Connect Steam to fill your dashboard
            </h2>

            <p>
              Enter your 17-digit Steam ID.
              Achievement Hub will import
              your profile, game library,
              playtime, achievements, XP,
              level, and completion data.
            </p>

            <Link
              className="info-primary-button"
              to="/profile"
            >
              <Link2 size={18} />
              Connect Steam
            </Link>
          </section>
        ) : games.length === 0 ? (
          <section className="empty-data-card dashboard-empty-state">
            <div className="empty-data-icon">
              <RefreshCw />
            </div>

            <span className="panel-eyebrow">
              Steam is connected
            </span>

            <h2>
              Synchronize your Steam data
            </h2>

            <p>
              Press Sync Everything to import
              your games, playtime, and
              achievements automatically.
            </p>

            <button
              className="info-primary-button"
              type="button"
              onClick={handleSyncEverything}
              disabled={syncing}
            >
              <RefreshCw
                size={18}
                className={
                  syncing
                    ? "dashboard-sync-spin"
                    : ""
                }
              />

              {syncing
                ? "Synchronizing..."
                : "Sync Everything"}
            </button>
          </section>
        ) : (
          <>
            <section className="dashboard-progress-section">
              <div className="dashboard-progress-heading">
                <div>
                  <span className="panel-eyebrow">
                    Account Progress
                  </span>

                  <h2>
                    Level {level}
                  </h2>
                </div>

                <strong>
                  {completionPercentage}%
                  complete
                </strong>
              </div>

              <div className="dashboard-large-progress">
                <div
                  style={{
                    width: `${completionPercentage}%`
                  }}
                ></div>
              </div>

              <div className="dashboard-progress-details">
                <span>
                  <CheckCircle2 size={16} />
                  {achievementsUnlocked}
                  {" "}unlocked
                </span>

                <span>
                  <LockKeyhole size={16} />
                  {lockedAchievements}
                  {" "}locked
                </span>

                <span>
                  <Clock3 size={16} />
                  {totalPlaytimeHours.toLocaleString()}
                  {" "}hours played
                </span>
              </div>
            </section>

            <div className="dashboard-live-grid">
              <section className="dashboard-live-panel">
                <div className="dashboard-panel-heading">
                  <div>
                    <span className="panel-eyebrow">
                      Your Library
                    </span>

                    <h2>
                      Recently Played
                    </h2>
                  </div>

                  <Link to="/my-games">
                    View all
                  </Link>
                </div>

                {recentGames.length === 0 ? (
                  <div className="dashboard-panel-empty">
                    No recent games available.
                  </div>
                ) : (
                  <div className="dashboard-recent-games">
                    {recentGames.map(
                      (game) => (
                        <Link
                          className="dashboard-recent-game"
                          to={`/games/${game.appId}`}
                          key={game.appId}
                        >
                          <div className="dashboard-game-image">
                            {game.headerImage ? (
                              <img
                                src={
                                  game.headerImage
                                }
                                alt={
                                  game.name
                                }
                              />
                            ) : (
                              <Gamepad2 />
                            )}
                          </div>

                          <div className="dashboard-game-info">
                            <h3>
                              {game.name}
                            </h3>

                            <span>
                              <Clock3 size={14} />

                              {game.playtimeHours ||
                                0}
                              {" "}hours
                            </span>
                          </div>

                          <strong>
                            {game.completionPercentage ||
                              0}
                            %
                          </strong>
                        </Link>
                      )
                    )}
                  </div>
                )}
              </section>

              <section className="dashboard-live-panel">
                <div className="dashboard-panel-heading">
                  <div>
                    <span className="panel-eyebrow">
                      Latest Progress
                    </span>

                    <h2>
                      Recent Achievements
                    </h2>
                  </div>

                  <Link to="/achievements">
                    View all
                  </Link>
                </div>

                {recentAchievements.length ===
                0 ? (
                  <div className="dashboard-panel-empty">
                    No unlocked achievements yet.
                  </div>
                ) : (
                  <div className="dashboard-recent-achievements">
                    {recentAchievements.map(
                      (achievement) => (
                        <article
                          className="dashboard-achievement-item"
                          key={
                            achievement._id
                          }
                        >
                          <div className="dashboard-achievement-icon">
                            {achievement.icon ? (
                              <img
                                src={
                                  achievement.icon
                                }
                                alt={
                                  achievement.displayName
                                }
                              />
                            ) : (
                              <Trophy />
                            )}
                          </div>

                          <div>
                            <h3>
                              {
                                achievement.displayName
                              }
                            </h3>

                            <span>
                              {achievement.game
                                ?.name ||
                                "Steam Game"}
                            </span>

                            <p>
                              {formatUnlockDate(
                                achievement.unlockTime
                              )}
                            </p>
                          </div>

                          <strong>
                            +
                            {achievement.xpValue ||
                              0}
                            {" "}XP
                          </strong>
                        </article>
                      )
                    )}
                  </div>
                )}
              </section>
            </div>

            <section className="dashboard-live-panel dashboard-most-played-panel">
              <div className="dashboard-panel-heading">
                <div>
                  <span className="panel-eyebrow">
                    Game Activity
                  </span>

                  <h2>
                    Most Played Games
                  </h2>
                </div>

                <Link to="/my-games">
                  Open library
                </Link>
              </div>

              <div className="dashboard-most-played-grid">
                {mostPlayedGames.map(
                  (game) => (
                    <article
                      className="dashboard-most-played-card"
                      key={game.appId}
                    >
                      <div className="dashboard-most-played-image">
                        {game.headerImage ? (
                          <img
                            src={
                              game.headerImage
                            }
                            alt={game.name}
                          />
                        ) : (
                          <Gamepad2 />
                        )}
                      </div>

                      <div>
                        <h3>{game.name}</h3>

                        <span>
                          {game.playtimeHours ||
                            0}
                          {" "}hours played
                        </span>
                      </div>

                      <div className="dashboard-game-links">
                        <Link
                          to={`/games/${game.appId}`}
                        >
                          Details
                        </Link>

                        {game.storeUrl && (
                          <a
                            href={game.storeUrl}
                            target="_blank"
                            rel="noreferrer"
                            title="Open Steam store"
                          >
                            <ExternalLink
                              size={16}
                            />
                          </a>
                        )}
                      </div>
                    </article>
                  )
                )}
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  );
}

export default Dashboard;
