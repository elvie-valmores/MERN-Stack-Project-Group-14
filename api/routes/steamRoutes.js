const express = require("express");
const {
    connectSteam,
    getSteamProfile,
    getOwnedGames,
    getGameAchievements
} = require("../controllers/steamController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/connect", protect, connectSteam);
router.get("/profile", protect, getSteamProfile);
router.get("/games", protect, getOwnedGames);
router.get("/games/:appId/achievements", protect, getGameAchievements);

module.exports = router;
