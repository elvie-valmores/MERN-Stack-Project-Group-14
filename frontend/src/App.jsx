import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import MyGames from "./pages/MyGames";
import GameDetails from "./pages/GameDetails";
import Achievements from "./pages/Achievements";
import Leaderboard from "./pages/Leaderboard";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/my-games" element={<MyGames />} />
      <Route path="/games/:gameId" element={<GameDetails />} />
      <Route path="/achievements" element={<Achievements />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
    </Routes>
  );
}

export default App;
