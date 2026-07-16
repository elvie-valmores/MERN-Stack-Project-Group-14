import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  CalendarDays,
  CheckCircle2,
  Edit3,
  Gamepad2,
  Mail,
  Save,
  ShieldCheck,
  Sparkles,
  Trophy,
  User
} from "lucide-react";

function Profile() {
  const storedUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const userData = storedUser.user || storedUser;

  const [formData, setFormData] = useState({
    name: userData.name || "Player",
    email: userData.email || "",
    steamId: userData.steamId || ""
  });

  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const currentStoredUser = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    const currentUserData =
      currentStoredUser.user || currentStoredUser;

    setFormData({
      name: currentUserData.name || "Player",
      email: currentUserData.email || "",
      steamId: currentUserData.steamId || ""
    });
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const getStoredUserAndToken = () => {
    const currentStoredUser = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    const token =
      currentStoredUser.token ||
      currentStoredUser.user?.token;

    return {
      currentStoredUser,
      token
    };
  };

  const handleSave = async () => {
    try {
      const { token } = getStoredUserAndToken();

      if (!token) {
        setMessage("Please log in again.");
        return;
      }

      const response = await fetch(
        "http://localhost:5050/api/auth/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            steamId: formData.steamId
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Could not save profile."
        );
        return;
      }

      localStorage.setItem(
        "user",
        JSON.stringify(data)
      );

      setFormData({
        name: data.name,
        email: data.email,
        steamId: data.steamId || ""
      });

      setEditing(false);
      setMessage(
        "Profile changes saved to MongoDB."
      );

      setTimeout(() => {
        setMessage("");
      }, 2500);
    } catch (error) {
      setMessage(
        "Could not connect to the API."
      );
    }
  };

  const handleSteamConnect = async () => {
    try {
      const {
        currentStoredUser,
        token
      } = getStoredUserAndToken();

      if (!token) {
        setMessage("Please log in again.");
        return;
      }

      const steamId = formData.steamId.trim();

      if (!steamId) {
        setMessage(
          "Enter your 17-digit Steam ID."
        );
        return;
      }

      if (!/^\d{17}$/.test(steamId)) {
        setMessage(
          "Steam ID must contain exactly 17 numbers."
        );
        return;
      }

      const response = await fetch(
        "http://localhost:5050/api/steam/connect",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            steamId
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Could not connect Steam."
        );
        return;
      }

      const currentUserData =
        currentStoredUser.user ||
        currentStoredUser;

      const updatedUser = {
        ...currentUserData,
        steamId: data.steam.steamId,
        steamName: data.steam.steamName,
        steamAvatar: data.steam.steamAvatar,
        steamProfileUrl:
          data.steam.steamProfileUrl,
        token
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setFormData((current) => ({
        ...current,
        steamId: data.steam.steamId
      }));

      setMessage(
        `Steam connected: ${data.steam.steamName}`
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      setMessage(
        "Could not connect to the Steam API."
      );
    }
  };

  const initials =
    formData.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "P";

  const currentStoredUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const currentUserData =
    currentStoredUser.user ||
    currentStoredUser;

  const steamAvatar =
    currentUserData.steamAvatar || "";

  const steamName =
    currentUserData.steamName || "";

  const createdAt =
    currentUserData.createdAt || "";

  const memberSince = createdAt
    ? new Date(createdAt).getFullYear()
    : 2026;

  return (
    <main className="dashboard-page">
      <Sidebar />

      <section className="dashboard-content">
        <div className="profile-page-heading">
          <div>
            <span className="dashboard-eyebrow">
              Player Account
            </span>

            <h1>Profile</h1>

            <p>
              Manage your account information and
              Steam connection.
            </p>
          </div>

          <button
            className="profile-edit-button"
            onClick={() =>
              setEditing(!editing)
            }
          >
            <Edit3 size={18} />

            {editing
              ? "Cancel Editing"
              : "Edit Profile"}
          </button>
        </div>

        {message && (
          <div className="profile-success-message">
            <CheckCircle2 size={19} />
            {message}
          </div>
        )}

        <section className="profile-hero-card">
          {steamAvatar ? (
            <img
              className="profile-avatar"
              src={steamAvatar}
              alt={
                steamName
                  ? `${steamName} Steam avatar`
                  : "Steam avatar"
              }
            />
          ) : (
            <div className="profile-avatar">
              {initials}
            </div>
          )}

          <div className="profile-hero-info">
            <span className="profile-status">
              <CheckCircle2 size={15} />
              Active Account
            </span>

            <h2>
              {steamName ||
                formData.name ||
                "Player"}
            </h2>

            <p>
              {formData.steamId
                ? "Steam profile connected"
                : "Connect Steam to import your games and achievements."}
            </p>
          </div>

          <div className="profile-level">
            <Trophy />

            <div>
              <strong>Level 24</strong>
              <span>
                Achievement Hunter
              </span>
            </div>
          </div>
        </section>

        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <Gamepad2 />

            <div>
              <strong>24</strong>
              <span>Games Tracked</span>
            </div>
          </div>

          <div className="profile-stat-card">
            <Trophy />

            <div>
              <strong>184</strong>
              <span>Unlocked</span>
            </div>
          </div>

          <div className="profile-stat-card">
            <Sparkles />

            <div>
              <strong>9,440</strong>
              <span>Achievement XP</span>
            </div>
          </div>

          <div className="profile-stat-card">
            <CalendarDays />

            <div>
              <strong>{memberSince}</strong>
              <span>Member Since</span>
            </div>
          </div>
        </div>

        <div className="profile-main-grid">
          <section className="profile-panel">
            <div className="profile-panel-heading">
              <div>
                <span className="panel-eyebrow">
                  Account Details
                </span>

                <h2>
                  Personal Information
                </h2>
              </div>

              <User />
            </div>

            <div className="profile-form">
              <label htmlFor="profile-name">
                Full Name
              </label>

              <div className="profile-input-group">
                <User size={19} />

                <input
                  id="profile-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </div>

              <label htmlFor="profile-email">
                Email Address
              </label>

              <div className="profile-input-group">
                <Mail size={19} />

                <input
                  id="profile-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="No email available"
                />
              </div>

              {editing && (
                <button
                  className="profile-save-button"
                  onClick={handleSave}
                >
                  <Save size={18} />
                  Save Changes
                </button>
              )}
            </div>
          </section>

          <section className="profile-panel steam-profile-panel">
            <div className="profile-panel-heading">
              <div>
                <span className="panel-eyebrow">
                  Steam Integration
                </span>

                <h2>Connect Steam</h2>
              </div>

              <Gamepad2 />
            </div>

            <p className="steam-profile-description">
              Add your Steam ID to
              automatically import your library,
              playtime, and achievement
              progress.
            </p>

            <label htmlFor="profile-steam-id">
              Steam ID
            </label>

            <div className="profile-input-group">
              <Gamepad2 size={19} />

              <input
                id="profile-steam-id"
                name="steamId"
                type="text"
                placeholder="Enter your 17-digit Steam ID"
                value={formData.steamId}
                onChange={handleChange}
                maxLength={17}
              />
            </div>

            <button
              className="steam-connect-profile-button"
              onClick={handleSteamConnect}
            >
              <Gamepad2 size={18} />

              {formData.steamId
                ? "Update Steam Account"
                : "Connect Steam Account"}
            </button>

            <div className="steam-security-note">
              <ShieldCheck />

              <p>
                Your Steam credentials are
                never stored. We only use your
                public Steam ID.
              </p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default Profile;
