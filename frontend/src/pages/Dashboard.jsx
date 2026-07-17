import {
  useEffect,
  useState
} from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import Sidebar from "../components/Sidebar";
import PageLoading from "../components/PageLoading";

import {
  BarChart3,
  Gamepad2,
  Link2,
  Sparkles,
  Trophy
} from "lucide-react";

import {
  apiRequest,
  clearUser,
  getCurrentUser,
  getToken,
  saveUser
} from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(
    getCurrentUser()
  );

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      const token = getToken();

      if (!token) {
        clearUser();

        navigate("/login", {
          replace: true
        });

        return;
      }

      try {
        const data = await apiRequest(
          "/api/auth/profile"
        );

        const updatedUser =
          saveUser(data, token);

        setUser(updatedUser);
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
            "Could not load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

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

  const gamesTracked =
    user.gamesTracked || 0;

  const totalAchievements =
    user.totalAchievements || 0;

  const achievementsUnlocked =
    user.achievementsUnlocked || 0;

  const completionPercentage =
    user.completionPercentage || 0;

  return (
    <main className="dashboard-page">
      <Sidebar />

      <section className="dashboard-content">
        <div className="dashboard-heading-row">
          <div>
            <span className="dashboard-eyebrow">
              Player Dashboard
            </span>

            <h1>
              Welcome back,{" "}
              {user.name || "Player"} 👋
            </h1>

            <p>
              Track your games, achievements,
              and overall Steam progress.
            </p>
          </div>

          <Link
            className="dashboard-steam-btn"
            to="/profile"
          >
            <Link2 size={19} />

            {user.steamId
              ? "Steam Connected"
              : "Connect Steam"}
          </Link>
        </div>

        {message && (
          <div className="profile-page-message error">
            {message}
          </div>
        )}

        <div className="dashboard-stats">
          <div className="dash-card">
            <Gamepad2 />

            <div>
              <h3>{gamesTracked}</h3>
              <p>Games Tracked</p>
            </div>
          </div>

          <div className="dash-card">
            <Trophy />

            <div>
              <h3>{totalAchievements}</h3>
              <p>Total Achievements</p>
            </div>
          </div>

          <div className="dash-card">
            <Sparkles />

            <div>
              <h3>{achievementsUnlocked}</h3>
              <p>Achievements Unlocked</p>
            </div>
          </div>

          <div className="dash-card">
            <BarChart3 />

            <div>
              <h3>
                {completionPercentage}%
              </h3>

              <p>Overall Completion</p>
            </div>
          </div>
        </div>

        <section className="empty-data-card">
          <div className="empty-data-icon">
            <Gamepad2 />
          </div>

          <span className="panel-eyebrow">
            Steam data not imported
          </span>

          <h2>
            Connect your Steam account
          </h2>

          <p>
            Your recent games, achievements,
            playtime, and activity will appear
            here after Steam synchronization.
          </p>

          <Link
            className="info-primary-button"
            to="/profile"
          >
            <Link2 size={18} />
            Connect Steam
          </Link>
        </section>
      </section>
    </main>
  );
}

export default Dashboard;
