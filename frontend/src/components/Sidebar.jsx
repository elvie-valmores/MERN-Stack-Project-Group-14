import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
import achievementLogo from "../assets/images/223-cropped.png";

function Sidebar() {
  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <aside className="sidebar">
      <div>
        <NavLink to="/" className="sidebar-logo sidebar-logo-only">
          <img
            src={achievementLogo}
            alt="Achievement Hub"
            className="sidebar-logo-image"
          />
        </NavLink>

        <nav>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/my-games">My Games</NavLink>
          <NavLink to="/achievements">Achievements</NavLink>
          <NavLink to="/leaderboard">Leaderboard</NavLink>
          <NavLink to="/profile">Profile</NavLink>
        </nav>
      </div>

      <button className="logout-btn" onClick={logout}>
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;
