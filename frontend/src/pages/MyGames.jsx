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
  Clock3,
  ExternalLink,
  Gamepad2,
  Library,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trophy
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import PageLoading from "../components/PageLoading";

import {
  apiRequest,
  clearUser
} from "../services/api";

import "./MyGames.css";

function MyGames() {
  const navigate = useNavigate();

  const [games, setGames] =
    useState([]);

  const [connected, setConnected] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [syncing, setSyncing] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [sort, setSort] =
    useState("playtime");

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

  const loadGames = async () => {
    try {
      const data =
        await apiRequest(
          "/api/steam/games"
        );

      setGames(
        data.games || []
      );

      setConnected(
        Boolean(data.connected)
      );

      setTotalPlaytimeHours(
        data.totalPlaytimeHours || 0
      );

      setLastSyncedAt(
        data.lastSyncedAt || null
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
          "Could not load your games.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setMessage("");
    setMessageType("");

    try {
      const data =
        await apiRequest(
          "/api/steam/games/sync",
          {
            method: "POST"
          }
        );

      setGames(
        data.games || []
      );

      setConnected(true);

      setLastSyncedAt(
        data.lastSyncedAt || null
      );

      const playtimeMinutes =
        (data.games || []).reduce(
          (total, game) =>
            total +
            (game.playtimeForever || 0),
          0
        );

      setTotalPlaytimeHours(
        Math.round(
          (playtimeMinutes / 60) *
            10
        ) / 10
      );

      showMessage(
        data.message ||
          "Steam games synchronized."
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
          "Could not synchronize Steam games.",
        "error"
      );
    } finally {
      setSyncing(false);
    }
  };

  const filteredGames =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      let result =
        games.filter((game) =>
          game.name
            .toLowerCase()
            .includes(query)
        );

      result = [...result];

      if (sort === "name") {
        result.sort((first, second) =>
          first.name.localeCompare(
            second.name
          )
        );
      }

      if (sort === "playtime") {
        result.sort(
          (first, second) =>
            second.playtimeForever -
            first.playtimeForever
        );
      }

      if (sort === "recent") {
        result.sort((first, second) => {
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
        });
      }

      if (sort === "completion") {
        result.sort(
          (first, second) =>
            second.completionPercentage -
            first.completionPercentage
        );
      }

      return result;
    }, [
      games,
      search,
      sort
    ]);

  const gamesWithAchievements =
    games.filter(
      (game) =>
        game.achievementsSupported
    ).length;

  const formatDate = (date) => {
    if (!date) {
      return "Not synced yet";
    }

    return new Date(
      date
    ).toLocaleString();
  };

  if (loading) {
    return (
      <main className="dashboard-page">
        <Sidebar />

        <section className="dashboard-content">
          <PageLoading message="Loading your Steam library..." />
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <Sidebar />

      <section className="dashboard-content">
        <div className="my-games-heading">
          <div>
            <span className="dashboard-eyebrow">
              Your Steam Library
            </span>

            <h1>My Games</h1>

            <p>
              View your imported Steam games,
              playtime, and achievement progress.
            </p>
          </div>

          {connected && (
            <button
              className="my-games-sync-button"
              type="button"
              onClick={handleSync}
              disabled={syncing}
            >
              <RefreshCw
                className={
                  syncing
                    ? "sync-icon-spinning"
                    : ""
                }
                size={18}
              />

              {syncing
                ? "Syncing..."
                : "Sync Steam Games"}
            </button>
          )}
        </div>

        {message && (
          <div
            className={`profile-page-message ${messageType}`}
          >
            {message}
          </div>
        )}

        {!connected ? (
          <section className="empty-data-card">
            <div className="empty-data-icon">
              <Library />
            </div>

            <span className="panel-eyebrow">
              Steam is not connected
            </span>

            <h2>
              Connect your Steam account
            </h2>

            <p>
              Enter your 17-digit Steam ID
              from the Profile page. After
              connecting it, your game library
              can be imported automatically.
            </p>

            <Link
              className="info-primary-button"
              to="/profile"
            >
              <Gamepad2 size={18} />
              Connect Steam
            </Link>
          </section>
        ) : games.length === 0 ? (
          <section className="empty-data-card">
            <div className="empty-data-icon">
              <RefreshCw />
            </div>

            <span className="panel-eyebrow">
              No games imported
            </span>

            <h2>
              Synchronize your Steam library
            </h2>

            <p>
              Your Steam account is connected.
              Press the button below to import
              your owned games and playtime.
            </p>

            <button
              className="info-primary-button"
              type="button"
              onClick={handleSync}
              disabled={syncing}
            >
              <RefreshCw
                className={
                  syncing
                    ? "sync-icon-spinning"
                    : ""
                }
                size={18}
              />

              {syncing
                ? "Synchronizing..."
                : "Import Steam Games"}
            </button>
          </section>
        ) : (
          <>
            <section className="my-games-summary">
              <article>
                <Library />

                <div>
                  <strong>
                    {games.length}
                  </strong>

                  <span>
                    Games Imported
                  </span>
                </div>
              </article>

              <article>
                <Clock3 />

                <div>
                  <strong>
                    {totalPlaytimeHours.toLocaleString()}
                  </strong>

                  <span>
                    Hours Played
                  </span>
                </div>
              </article>

              <article>
                <Trophy />

                <div>
                  <strong>
                    {gamesWithAchievements}
                  </strong>

                  <span>
                    Achievement Games
                  </span>
                </div>
              </article>
            </section>

            <section className="my-games-controls">
              <div className="my-games-search">
                <Search size={19} />

                <input
                  type="text"
                  placeholder="Search your games..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="my-games-sort">
                <SlidersHorizontal
                  size={18}
                />

                <select
                  value={sort}
                  onChange={(event) =>
                    setSort(
                      event.target.value
                    )
                  }
                >
                  <option value="playtime">
                    Most Played
                  </option>

                  <option value="recent">
                    Recently Played
                  </option>

                  <option value="name">
                    Game Name
                  </option>

                  <option value="completion">
                    Completion
                  </option>
                </select>
              </div>
            </section>

            <div className="my-games-sync-time">
              Last synchronized:{" "}
              {formatDate(lastSyncedAt)}
            </div>

            {filteredGames.length === 0 ? (
              <section className="my-games-no-results">
                <Search size={34} />

                <h2>
                  No matching games
                </h2>

                <p>
                  Try searching for a different
                  game name.
                </p>
              </section>
            ) : (
              <section className="my-games-grid">
                {filteredGames.map(
                  (game) => (
                    <article
                      className="steam-game-card"
                      key={game.appId}
                    >
                      <div className="steam-game-image">
                        <img
                          src={
                            game.headerImage
                          }
                          alt={game.name}
                          onError={(event) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />

                        <div className="steam-game-image-fallback">
                          <Gamepad2 />
                        </div>

                        <span className="steam-game-playtime">
                          <Clock3 size={14} />

                          {game.playtimeHours}
                          {" "}hours
                        </span>
                      </div>

                      <div className="steam-game-card-body">
                        <div className="steam-game-title-row">
                          <div>
                            <span>
                              Steam App{" "}
                              {game.appId}
                            </span>

                            <h2>
                              {game.name}
                            </h2>
                          </div>

                          <a
                            href={
                              game.storeUrl
                            }
                            target="_blank"
                            rel="noreferrer"
                            title="Open Steam store"
                          >
                            <ExternalLink
                              size={18}
                            />
                          </a>
                        </div>

                        <div className="steam-game-progress-row">
                          <span>
                            Achievement progress
                          </span>

                          <strong>
                            {game.completionPercentage ||
                              0}
                            %
                          </strong>
                        </div>

                        <div className="steam-game-progress">
                          <div
                            style={{
                              width: `${
                                game.completionPercentage ||
                                0
                              }%`
                            }}
                          ></div>
                        </div>

                        <div className="steam-game-card-footer">
                          <span>
                            <Trophy
                              size={15}
                            />

                            {game.achievementsUnlocked ||
                              0}
                            /
                            {game.totalAchievements ||
                              0}
                          </span>

                          <Link
                            to={`/games/${game.appId}`}
                          >
                            View Details
                          </Link>
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

export default MyGames;
