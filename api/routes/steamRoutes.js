const express = require("express");

const protect = require(
  "../middleware/authMiddleware"
);

const {
  connectSteam,
  getSteamProfile,
  refreshSteamProfile,
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

router.delete(
  "/disconnect",
  protect,
  disconnectSteam
);

module.exports = router;
