import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Link,
  useNavigate,
  useParams
} from "react-router-dom";

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Gamepad2,
  LockKeyhole,
  RefreshCw,
  Search,
  Trophy
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import PageLoading from "../components/PageLoading";

import {
  apiRequest,
  clearUser
} from "../services/api";

import "./GameDetails.css";

function GameDetails() {
  const { appId } = useParams();
  const navigate = useNavigate();

  const [game, setGame] =
    useState(null);

  const [achievements, setAchievements] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [syncing, setSyncing] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("all");

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("");

  const showMessage = (
    text,
    type = "success"
  ) => {
    setMessage(text);
    setMessageType(type);
  };

  const loadGame = async () => {
    try {
      const data = await apiRequest(
        `/api/achievements/game/${appId}`
      );

      setGame(data.game || null);

      setAchievements(
        data.achievements || []
      );
    } catch (error) {
      if (error.status === 401) {
        clearUser();

        navigate("/login", {
          replace: true
        });

        return;
      }

      showMessage(
        error.message ||
          "Could not load game details.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGame();
  }, [appId]);

  const handleSync = async () => {
    setSyncing(true);
    setMessage("");
    setMessageType("");

    try {
      const data = await apiRequest(
        `/api/achievements/sync/${appId}`,
        {
          method: "POST"
        }
      );

      showMessage(
        data.message ||
          "Game achievements synchronized."
      );

      await loadGame();
    } catch (error) {
      if (error.status === 401) {
        clearUser();

        navigate("/login", {
          replace: true
        });

        return;
      }

      showMessage(
        error.message ||
          "Could not synchronize achievements.",
        "error"
      );
    } finally {
      setSyncing(false);
    }
  };

  const filteredAchievements =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return achievements.filter(
        (achievement) => {
          const matchesSearch =
            achievement.displayName
              .toLowerCase()
              .includes(query) ||
            achievement.description
              .toLowerCase()
              .includes(query);

          const matchesStatus =
            status === "all" ||
            (
              status === "unlocked" &&
              achievement.achieved
            ) ||
            (
              status === "locked" &&
              !achievement.achieved
            );

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      achievements,
      search,
      status
    ]);

  const unlockedCount =
    achievements.filter(
      (achievement) =>
        achievement.achieved
    ).length;

  const lockedCount =
    achievements.length -
    unlockedCount;

  const formatUnlockDate = (date) => {
    if (!date) {
      return "Locked";
    }

    return new Date(
      date
    ).toLocaleDateString(
      undefined,
      {
        year: "numeric",
        month: "short",
        day: "numeric"
      }
    );
  };

  if (loading) {
    return (
      <main className="dashboard-page">
        <Sidebar />

        <section className="dashboard-content">
          <PageLoading message="Loading game details..." />
        </section>
      </main>
    );
  }

  if (!game) {
    return (
      <main className="dashboard-page">
        <Sidebar />

        <section className="dashboard-content">
          <section className="empty-data-card">
            <div className="empty-data-icon">
              <Gamepad2 />
            </div>

            <span className="panel-eyebrow">
              Game not found
            </span>

            <h2>
              This game is not in your library
            </h2>

            <p>
              Return to My Games and select an
              imported Steam game.
            </p>

            <Link
              className="info-primary-button"
              to="/my-games"
            >
              <ArrowLeft size={18} />
              Back to My Games
            </Link>
          </section>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <Sidebar />

      <section className="dashboard-content">
        <Link
          className="game-details-back"
          to="/my-games"
        >
          <ArrowLeft size={18} />
          Back to My Games
        </Link>

        {message && (
          <div
            className={`profile-page-message ${messageType}`}
          >
            {message}
          </div>
        )}

        <section className="game-details-hero">
          <div className="game-details-image">
            {game.headerImage ? (
              <img
                src={game.headerImage}
                alt={game.name}
              />
            ) : (
              <Gamepad2 />
            )}
          </div>

          <div className="game-details-main">
            <span className="dashboard-eyebrow">
              Steam Game
            </span>

            <h1>{game.name}</h1>

            <p>
              Steam App ID: {game.appId}
            </p>

            <div className="game-details-actions">
              <button
                type="button"
                onClick={handleSync}
                disabled={syncing}
              >
                <RefreshCw
                  size={18}
                  className={
                    syncing
                      ? "game-sync-spin"
                      : ""
                  }
                />

                {syncing
                  ? "Syncing..."
                  : "Sync Achievements"}
              </button>

              {game.storeUrl && (
                <a
                  href={game.storeUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink size={18} />
                  Steam Store
                </a>
              )}
            </div>
          </div>
        </section>

        <section className="game-details-stats">
          <article>
            <Clock3 />

            <div>
              <strong>
                {game.playtimeHours || 0}
              </strong>

              <span>Hours Played</span>
            </div>
          </article>

          <article>
            <Trophy />

            <div>
              <strong>
                {game.totalAchievements || 0}
              </strong>

              <span>Total Achievements</span>
            </div>
          </article>

          <article>
            <CheckCircle2 />

            <div>
              <strong>
                {game.achievementsUnlocked || 0}
              </strong>

              <span>Unlocked</span>
            </div>
          </article>

          <article>
            <LockKeyhole />

            <div>
              <strong>
                {Math.max(
                  0,
                  (game.totalAchievements || 0) -
                    (game.achievementsUnlocked || 0)
                )}
              </strong>

              <span>Locked</span>
            </div>
          </article>
        </section>

        <section className="game-completion-card">
          <div>
            <span>
              Achievement Completion
            </span>

            <strong>
              {game.completionPercentage || 0}%
            </strong>
          </div>

          <div className="game-completion-progress">
            <div
              style={{
                width: `${
                  game.completionPercentage || 0
                }%`
              }}
            ></div>
          </div>
        </section>

        {!game.achievementsSupported ||
        achievements.length === 0 ? (
          <section className="empty-data-card game-details-empty">
            <div className="empty-data-icon">
              <Trophy />
            </div>

            <span className="panel-eyebrow">
              No achievement data
            </span>

            <h2>
              Achievements are not available yet
            </h2>

            <p>
              This game may not support Steam
              achievements, or its achievement
              data has not been synchronized yet.
            </p>

            <button
              className="info-primary-button"
              type="button"
              onClick={handleSync}
              disabled={syncing}
            >
              <RefreshCw
                size={18}
                className={
                  syncing
                    ? "game-sync-spin"
                    : ""
                }
              />

              {syncing
                ? "Synchronizing..."
                : "Try Achievement Sync"}
            </button>
          </section>
        ) : (
          <>
            <section className="game-achievement-controls">
              <div className="game-achievement-search">
                <Search size={19} />

                <input
                  type="text"
                  placeholder="Search achievements..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="game-achievement-filters">
                <button
                  type="button"
                  className={
                    status === "all"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setStatus("all")
                  }
                >
                  All ({achievements.length})
                </button>

                <button
                  type="button"
                  className={
                    status === "unlocked"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setStatus("unlocked")
                  }
                >
                  Unlocked ({unlockedCount})
                </button>

                <button
                  type="button"
                  className={
                    status === "locked"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setStatus("locked")
                  }
                >
                  Locked ({lockedCount})
                </button>
              </div>
            </section>

            {filteredAchievements.length === 0 ? (
              <section className="game-achievement-no-results">
                <Search size={34} />

                <h2>
                  No matching achievements
                </h2>

                <p>
                  Try another search or filter.
                </p>
              </section>
            ) : (
              <section className="game-achievement-list">
                {filteredAchievements.map(
                  (achievement) => (
                    <article
                      className={`game-achievement-row ${
                        achievement.achieved
                          ? "unlocked"
                          : "locked"
                      }`}
                      key={achievement._id}
                    >
                      <div className="game-achievement-icon">
                        {achievement.icon ||
                        achievement.iconGray ? (
                          <img
                            src={
                              achievement.achieved
                                ? achievement.icon
                                : achievement.iconGray ||
                                  achievement.icon
                            }
                            alt={
                              achievement.displayName
                            }
                          />
                        ) : achievement.achieved ? (
                          <Trophy />
                        ) : (
                          <LockKeyhole />
                        )}
                      </div>

                      <div className="game-achievement-info">
                        <div>
                          <h2>
                            {achievement.displayName}
                          </h2>

                          <span>
                            {achievement.achieved
                              ? "Unlocked"
                              : "Locked"}
                          </span>
                        </div>

                        <p>
                          {achievement.description ||
                            (
                              achievement.hidden
                                ? "Hidden achievement"
                                : "No description available."
                            )}
                        </p>
                      </div>

                      <div className="game-achievement-date">
                        <strong>
                          +
                          {achievement.xpValue || 0}
                          {" "}XP
                        </strong>

                        <span>
                          {formatUnlockDate(
                            achievement.unlockTime
                          )}
                        </span>
                      </div>
                    </article>
                  )
                )}
              </section>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default GameDetails;
