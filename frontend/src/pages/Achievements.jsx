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
  CheckCircle2,
  Gamepad2,
  LockKeyhole,
  RefreshCw,
  Search,
  Sparkles,
  Trophy
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import PageLoading from "../components/PageLoading";

import {
  apiRequest,
  clearUser
} from "../services/api";

import "./Achievements.css";

function Achievements() {
  const navigate = useNavigate();

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

  const [statistics, setStatistics] =
    useState({
      totalAchievements: 0,
      achievementsUnlocked: 0,
      achievementsLocked: 0,
      achievementXP: 0,
      completionPercentage: 0
    });

  const showMessage = (
    text,
    type = "success"
  ) => {
    setMessage(text);
    setMessageType(type);
  };

  const loadAchievements = async () => {
    try {
      const data = await apiRequest(
        "/api/achievements"
      );

      setAchievements(
        data.achievements || []
      );

      setStatistics({
        totalAchievements:
          data.totalAchievements || 0,

        achievementsUnlocked:
          data.achievementsUnlocked || 0,

        achievementsLocked:
          data.achievementsLocked || 0,

        achievementXP:
          data.achievementXP || 0,

        completionPercentage:
          data.completionPercentage || 0
      });
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
          "Could not load achievements.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setMessage("");
    setMessageType("");

    try {
      const data = await apiRequest(
        "/api/achievements/sync",
        {
          method: "POST"
        }
      );

      showMessage(
        data.message ||
          "Achievements synchronized successfully."
      );

      await loadAchievements();
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
              .includes(query) ||
            achievement.game?.name
              ?.toLowerCase()
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
          <PageLoading message="Loading achievements..." />
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <Sidebar />

      <section className="dashboard-content">
        <div className="achievements-heading">
          <div>
            <span className="dashboard-eyebrow">
              Achievement Collection
            </span>

            <h1>Achievements</h1>

            <p>
              View unlocked and locked Steam
              achievements across your games.
            </p>
          </div>

          <button
            className="achievement-sync-button"
            type="button"
            onClick={handleSync}
            disabled={syncing}
          >
            <RefreshCw
              size={18}
              className={
                syncing
                  ? "achievement-sync-spin"
                  : ""
              }
            />

            {syncing
              ? "Syncing..."
              : "Sync Achievements"}
          </button>
        </div>

        {message && (
          <div
            className={`profile-page-message ${messageType}`}
          >
            {message}
          </div>
        )}

        {statistics.totalAchievements ===
        0 ? (
          <section className="empty-data-card">
            <div className="empty-data-icon">
              <Trophy />
            </div>

            <span className="panel-eyebrow">
              No achievements imported
            </span>

            <h2>
              Import your Steam achievements
            </h2>

            <p>
              Connect your Steam account,
              synchronize your game library,
              and then import achievement data.
            </p>

            <div className="achievement-empty-actions">
              <Link
                className="info-primary-button"
                to="/my-games"
              >
                <Gamepad2 size={18} />
                Open My Games
              </Link>

              <button
                className="achievement-secondary-button"
                type="button"
                onClick={handleSync}
                disabled={syncing}
              >
                <RefreshCw
                  size={18}
                  className={
                    syncing
                      ? "achievement-sync-spin"
                      : ""
                  }
                />

                {syncing
                  ? "Synchronizing..."
                  : "Import Achievements"}
              </button>
            </div>
          </section>
        ) : (
          <>
            <section className="achievement-summary-grid">
              <article>
                <Trophy />

                <div>
                  <strong>
                    {
                      statistics
                        .totalAchievements
                    }
                  </strong>

                  <span>
                    Total Achievements
                  </span>
                </div>
              </article>

              <article>
                <CheckCircle2 />

                <div>
                  <strong>
                    {
                      statistics
                        .achievementsUnlocked
                    }
                  </strong>

                  <span>Unlocked</span>
                </div>
              </article>

              <article>
                <LockKeyhole />

                <div>
                  <strong>
                    {
                      statistics
                        .achievementsLocked
                    }
                  </strong>

                  <span>Locked</span>
                </div>
              </article>

              <article>
                <Sparkles />

                <div>
                  <strong>
                    {statistics.achievementXP.toLocaleString()}
                  </strong>

                  <span>Achievement XP</span>
                </div>
              </article>
            </section>

            <section className="achievement-progress-card">
              <div>
                <span>
                  Overall completion
                </span>

                <strong>
                  {
                    statistics
                      .completionPercentage
                  }
                  %
                </strong>
              </div>

              <div className="achievement-main-progress">
                <div
                  style={{
                    width: `${
                      statistics
                        .completionPercentage
                    }%`
                  }}
                ></div>
              </div>
            </section>

            <section className="achievement-controls">
              <div className="achievement-search-box">
                <Search size={19} />

                <input
                  type="text"
                  placeholder="Search achievements or games..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="achievement-filter-buttons">
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
                  All
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
                  Unlocked
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
                  Locked
                </button>
              </div>
            </section>

            {filteredAchievements.length ===
            0 ? (
              <section className="achievement-no-results">
                <Search size={34} />

                <h2>
                  No matching achievements
                </h2>

                <p>
                  Try another search or filter.
                </p>
              </section>
            ) : (
              <section className="achievement-grid">
                {filteredAchievements.map(
                  (achievement) => (
                    <article
                      className={`achievement-card ${
                        achievement.achieved
                          ? "achievement-unlocked"
                          : "achievement-locked"
                      }`}
                      key={achievement._id}
                    >
                      <div className="achievement-icon-wrap">
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

                        <span className="achievement-status-icon">
                          {achievement.achieved ? (
                            <CheckCircle2 />
                          ) : (
                            <LockKeyhole />
                          )}
                        </span>
                      </div>

                      <div className="achievement-card-content">
                        <span className="achievement-game-name">
                          {achievement.game?.name ||
                            "Steam Game"}
                        </span>

                        <h2>
                          {achievement.displayName}
                        </h2>

                        <p>
                          {achievement.description ||
                            (
                              achievement.hidden
                                ? "Hidden achievement"
                                : "No description available."
                            )}
                        </p>

                        <div className="achievement-card-footer">
                          <span>
                            {achievement.achieved
                              ? formatUnlockDate(
                                  achievement.unlockTime
                                )
                              : "Locked"}
                          </span>

                          <strong>
                            +
                            {achievement.xpValue ||
                              0}{" "}
                            XP
                          </strong>
                        </div>
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

export default Achievements;
