const express = require("express");

const protect = require(
  "../middleware/authMiddleware"
);

const {
  syncAchievements,
  syncSingleGameAchievements,
  getAchievements,
  getGameAchievements
} = require(
  "../controllers/achievementController"
);

const router = express.Router();

router.post(
  "/sync",
  protect,
  syncAchievements
);

router.post(
  "/sync/:appId",
  protect,
  syncSingleGameAchievements
);

router.get(
  "/",
  protect,
  getAchievements
);

router.get(
  "/game/:appId",
  protect,
  getGameAchievements
);

module.exports = router;
