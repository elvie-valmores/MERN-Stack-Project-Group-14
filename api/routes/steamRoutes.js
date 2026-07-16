const express = require("express");
const {
    connectSteam,
    getSteamProfile,
    getOwnedGames
} = require("../controllers/steamController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/connect", protect, connectSteam);
router.get("/profile", protect, getSteamProfile);
router.get("/games", protect, getOwnedGames);

module.exports = router;
