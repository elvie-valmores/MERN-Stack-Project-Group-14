const express = require("express");

const protect = require(
  "../middleware/authMiddleware"
);

const {
  connectSteam,
  getSteamProfile,
  refreshSteamProfile,
  syncOwnedGames,
  getOwnedGames,
  getGameDetails,
  disconnectSteam
} = require(
  "../controllers/steamController"
);

const router = express.Router();

router.post(
  "/connect",
  protect,
  connectSteam
);

router.get(
  "/profile",
  protect,
  getSteamProfile
);

router.put(
  "/refresh",
  protect,
  refreshSteamProfile
);

router.post(
  "/games/sync",
  protect,
  syncOwnedGames
);

router.get(
  "/games",
  protect,
  getOwnedGames
);

router.get(
  "/games/:appId",
  protect,
  getGameDetails
);

router.delete(
  "/disconnect",
  protect,
  disconnectSteam
);

module.exports = router;
