import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  Clock3,
  Gamepad2,
  Search,
  SlidersHorizontal,
  Trophy
} from "lucide-react";

function MyGames() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const games = [
    {
      id: 1,
      name: "Counter-Strike 2",
      image:
        "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/730/header.jpg",
      progress: 87,
      achievements: 142,
      unlocked: 124,
      hours: 425,
      status: "In Progress",
      slug: "counter-strike-2"
    },
    {
      id: 2,
      name: "Red Dead Redemption 2",
      image:
        "https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg",
      progress: 61,
      achievements: 51,
      unlocked: 31,
      hours: 298,
      status: "In Progress",
      slug: "red-dead-redemption-2"
    },
    {
      id: 3,
      name: "Elden Ring",
      image:
        "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg",
      progress: 42,
      achievements: 42,
      unlocked: 18,
      hours: 186,
      status: "In Progress",
      slug: "elden-ring"
    },
    {
      id: 4,
      name: "Grand Theft Auto V",
      image:
        "https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg",
      progress: 100,
      achievements: 77,
      unlocked: 77,
      hours: 522,
      status: "Completed",
      slug: "grand-theft-auto-v"
    },
    {
      id: 5,
      name: "Cyberpunk 2077",
      image:
        "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg",
      progress: 73,
      achievements: 57,
      unlocked: 42,
      hours: 214,
      status: "In Progress",
      slug: "cyberpunk-2077"
    },
    {
      id: 6,
      name: "The Witcher 3",
      image:
        "https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg",
      progress: 100,
      achievements: 78,
      unlocked: 78,
      hours: 386,
      status: "Completed",
      slug: "the-witcher-3"
    }
  ];

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesSearch = game.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" || game.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  return (
    <main className="dashboard-page">
      <Sidebar />

      <section className="dashboard-content">
        <div className="games-page-heading">
          <div>
            <span className="dashboard-eyebrow">Steam Library</span>

            <h1>My Games</h1>

            <p>
              Browse your library and track achievement progress for every
              game.
            </p>
          </div>

          <div className="games-summary">
            <Gamepad2 />

            <div>
              <strong>{games.length}</strong>
              <span>Games Tracked</span>
            </div>
          </div>
        </div>

        <section className="games-toolbar">
          <div className="games-search-box">
            <Search size={20} />

            <input
              type="text"
              placeholder="Search your games..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="games-filter-group">
            <SlidersHorizontal size={19} />

            {["All", "In Progress", "Completed"].map((option) => (
              <button
                key={option}
                className={filter === option ? "active" : ""}
                onClick={() => setFilter(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </section>

        <div className="games-results-row">
          <span>
            Showing {filteredGames.length} of {games.length} games
          </span>
        </div>

        {filteredGames.length > 0 ? (
          <div className="my-games-grid">
            {filteredGames.map((game) => (
              <article className="my-game-card" key={game.id}>
                <div className="my-game-image">
                  <img src={game.image} alt={game.name} />

                  <span
                    className={
                      game.status === "Completed"
                        ? "game-status completed"
                        : "game-status progress"
                    }
                  >
                    {game.status}
                  </span>
                </div>

                <div className="my-game-content">
                  <h2>{game.name}</h2>

                  <div className="my-game-stats">
                    <span>
                      <Clock3 size={16} />
                      {game.hours} hours
                    </span>

                    <span>
                      <Trophy size={16} />
                      {game.unlocked}/{game.achievements}
                    </span>
                  </div>

                  <div className="my-game-progress-label">
                    <span>Achievement Progress</span>
                    <strong>{game.progress}%</strong>
                  </div>

                  <div className="my-game-progress">
                    <div style={{ width: `${game.progress}%` }}></div>
                  </div>

                  <Link
                    className="game-details-btn"
                    to={`/games/${game.slug}`}
                  >
                    View Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="games-empty-state">
            <Gamepad2 />

            <h2>No games found</h2>

            <p>Try another search or filter.</p>
          </div>
        )}
      </section>
    </main>
  );
}

export default MyGames;
