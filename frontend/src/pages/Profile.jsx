import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  apiRequest,
  clearUser,
  getStoredUser,
  getToken,
  saveUser
} from "../services/api";

import {
  CalendarDays,
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  Gamepad2,
  KeyRound,
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

  const userData =
    storedUser.user || storedUser;

  const [profileUser, setProfileUser] =
    useState(userData);

  const [formData, setFormData] = useState({
    name: userData.name || "Player",
    email: userData.email || "",
    steamId: userData.steamId || ""
  });

  const [passwordData, setPasswordData] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });

  const [editing, setEditing] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const getStoredUser = () => {
    return JSON.parse(
      localStorage.getItem("user") || "{}"
    );
  };

  const getToken = () => {
    const currentStoredUser = getStoredUser();

    return (
      currentStoredUser.token ||
      currentStoredUser.user?.token ||
      ""
    );
  };

  const showMessage = (
    text,
    type = "success"
  ) => {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3500);
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const currentStoredUser =
          getStoredUser();

        const currentUser =
          currentStoredUser.user ||
          currentStoredUser;

        const token = getToken();

        setProfileUser(currentUser);

        setFormData({
          name: currentUser.name || "Player",
          email: currentUser.email || "",
          steamId: currentUser.steamId || ""
        });

        if (!token) {
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:5050"}/api/auth/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("user");
          }

          showMessage(
            data.message ||
              "Could not load profile.",
            "error"
          );

          return;
        }

        const updatedUser = {
          ...data,
          token
        };

        localStorage.setItem(
          "user",
          JSON.stringify(updatedUser)
        );

        setProfileUser(updatedUser);

        setFormData({
          name: data.name || "Player",
          email: data.email || "",
          steamId: data.steamId || ""
        });
      } catch (error) {
        showMessage(
          "Could not connect to the API.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]:
        event.target.value
    });
  };

  const handlePasswordChange = (event) => {
    setPasswordData({
      ...passwordData,
      [event.target.name]:
        event.target.value
    });
  };

  const cancelEditing = () => {
    setFormData({
      name:
        profileUser?.name || "Player",
      email:
        profileUser?.email || "",
      steamId:
        profileUser?.steamId || ""
    });

    setEditing(false);
  };

  const handleSave = async () => {
    const token = getToken();

    if (!token) {
      showMessage(
        "Please log in again.",
        "error"
      );
      return;
    }

    if (!formData.name.trim()) {
      showMessage(
        "Name cannot be empty.",
        "error"
      );
      return;
    }

    if (!formData.email.trim()) {
      showMessage(
        "Email cannot be empty.",
        "error"
      );
      return;
    }

    setSavingProfile(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5050"}/api/auth/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`
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
        showMessage(
          data.message ||
            "Could not save profile.",
          "error"
        );
        return;
      }

      const updatedUser = {
        ...data,
        token: data.token || token
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setProfileUser(updatedUser);

      setFormData({
        name:
          updatedUser.name || "Player",
        email:
          updatedUser.email || "",
        steamId:
          updatedUser.steamId || ""
      });

      setEditing(false);

      showMessage(
        "Profile changes saved."
      );
    } catch (error) {
      showMessage(
        "Could not connect to the API.",
        "error"
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (
    event
  ) => {
    event.preventDefault();

    const token = getToken();

    if (!token) {
      showMessage(
        "Please log in again.",
        "error"
      );
      return;
    }

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      showMessage(
        "Please complete every password field.",
        "error"
      );
      return;
    }

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      showMessage(
        "New passwords do not match.",
        "error"
      );
      return;
    }

    if (
      passwordData.newPassword.length < 8
    ) {
      showMessage(
        "New password must be at least 8 characters.",
        "error"
      );
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5050"}/api/auth/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`
          },
          body: JSON.stringify(
            passwordData
          )
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showMessage(
          data.message ||
            "Could not change password.",
          "error"
        );
        return;
      }

      const currentStoredUser =
        getStoredUser();

      const currentUser =
        currentStoredUser.user ||
        currentStoredUser;

      const updatedUser = {
        ...currentUser,
        token: data.token || token
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      showMessage(
        data.message ||
          "Password changed successfully."
      );
    } catch (error) {
      showMessage(
        "Could not connect to the API.",
        "error"
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSteamConnect = async () => {
    const token = getToken();
    const steamId =
      formData.steamId.trim();

    if (!token) {
      showMessage(
        "Please log in again.",
        "error"
      );
      return;
    }

    if (!steamId) {
      showMessage(
        "Enter your 17-digit Steam ID.",
        "error"
      );
      return;
    }

    if (!/^\d{17}$/.test(steamId)) {
      showMessage(
        "Steam ID must contain exactly 17 numbers.",
        "error"
      );
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5050"}/api/steam/connect`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`
          },
          body: JSON.stringify({
            steamId
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showMessage(
          data.message ||
            "Could not connect Steam.",
          "error"
        );
        return;
      }

      const updatedUser = {
        ...profileUser,
        steamId:
          data.steam.steamId,
        steamName:
          data.steam.steamName,
        steamAvatar:
          data.steam.steamAvatar,
        steamProfileUrl:
          data.steam.steamProfileUrl,
        token
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setProfileUser(updatedUser);

      setFormData((current) => ({
        ...current,
        steamId:
          data.steam.steamId
      }));

      showMessage(
        `Steam connected: ${data.steam.steamName}`
      );
    } catch (error) {
      showMessage(
        "Could not connect to the Steam API.",
        "error"
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

  const steamAvatar =
    profileUser?.steamAvatar || "";

  const steamName =
    profileUser?.steamName || "";

  const gamesTracked =
    profileUser?.gamesTracked || 0;

  const achievementsUnlocked =
    profileUser?.achievementsUnlocked || 0;

  const achievementXP =
    profileUser?.achievementXP || 0;

  const level =
    profileUser?.level || 1;

  const createdAt =
    profileUser?.createdAt || "";

  const memberSince = createdAt
    ? new Date(createdAt).getFullYear()
    : new Date().getFullYear();

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
              Manage your account information,
              password, and Steam connection.
            </p>
          </div>

          <button
            className="profile-edit-button"
            onClick={() => {
              if (editing) {
                cancelEditing();
              } else {
                setEditing(true);
              }
            }}
          >
            <Edit3 size={18} />

            {editing
              ? "Cancel Editing"
              : "Edit Profile"}
          </button>
        </div>

        {message && (
          <div
            className={`profile-page-message ${messageType}`}
          >
            <CheckCircle2 size={19} />
            {message}
          </div>
        )}

        <section className="profile-hero-card">
          {steamAvatar ? (
            <img
              className="profile-avatar"
              src={steamAvatar}
              alt="Steam avatar"
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
              {loading
                ? "Loading..."
                : steamName ||
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
              <strong>
                Level {level}
              </strong>

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
              <strong>
                {gamesTracked}
              </strong>

              <span>
                Games Tracked
              </span>
            </div>
          </div>

          <div className="profile-stat-card">
            <Trophy />

            <div>
              <strong>
                {achievementsUnlocked}
              </strong>

              <span>Unlocked</span>
            </div>
          </div>

          <div className="profile-stat-card">
            <Sparkles />

            <div>
              <strong>
                {achievementXP.toLocaleString()}
              </strong>

              <span>
                Achievement XP
              </span>
            </div>
          </div>

          <div className="profile-stat-card">
            <CalendarDays />

            <div>
              <strong>
                {memberSince}
              </strong>

              <span>
                Member Since
              </span>
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
                />
              </div>

              {editing && (
                <button
                  className="profile-save-button"
                  onClick={handleSave}
                  disabled={savingProfile}
                >
                  <Save size={18} />

                  {savingProfile
                    ? "Saving..."
                    : "Save Changes"}
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

                <h2>
                  Connect Steam
                </h2>
              </div>

              <Gamepad2 />
            </div>

            <p className="steam-profile-description">
              Add your Steam ID to import
              your public game library and
              achievements.
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
                Your Steam password is never
                stored. Only your public Steam
                ID is used.
              </p>
            </div>
          </section>
        </div>

        <section className="profile-panel change-password-panel">
          <div className="profile-panel-heading">
            <div>
              <span className="panel-eyebrow">
                Security
              </span>

              <h2>Change Password</h2>
            </div>

            <KeyRound />
          </div>

          <p className="change-password-description">
            Enter your current password before
            choosing a new password.
          </p>

          <form
            className="change-password-form"
            onSubmit={handlePasswordSubmit}
          >
            <div className="password-field">
              <label htmlFor="current-password">
                Current Password
              </label>

              <div className="profile-input-group">
                <KeyRound size={19} />

                <input
                  id="current-password"
                  name="currentPassword"
                  type={
                    showCurrentPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter current password"
                  value={
                    passwordData.currentPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                />

                <button
                  type="button"
                  className="password-eye-button"
                  onClick={() =>
                    setShowCurrentPassword(
                      !showCurrentPassword
                    )
                  }
                >
                  {showCurrentPassword
                    ? <EyeOff size={18} />
                    : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="password-field">
              <label htmlFor="new-password">
                New Password
              </label>

              <div className="profile-input-group">
                <KeyRound size={19} />

                <input
                  id="new-password"
                  name="newPassword"
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="At least 8 characters"
                  value={
                    passwordData.newPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                />

                <button
                  type="button"
                  className="password-eye-button"
                  onClick={() =>
                    setShowNewPassword(
                      !showNewPassword
                    )
                  }
                >
                  {showNewPassword
                    ? <EyeOff size={18} />
                    : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="password-field">
              <label htmlFor="confirm-password">
                Confirm New Password
              </label>

              <div className="profile-input-group">
                <KeyRound size={19} />

                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter new password again"
                  value={
                    passwordData.confirmPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                />

                <button
                  type="button"
                  className="password-eye-button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  {showConfirmPassword
                    ? <EyeOff size={18} />
                    : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="profile-save-button change-password-button"
              disabled={changingPassword}
            >
              <KeyRound size={18} />

              {changingPassword
                ? "Changing Password..."
                : "Change Password"}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}

export default Profile;
