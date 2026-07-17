const User = require("../models/User");

const STEAM_API_BASE =
  "https://api.steampowered.com";

const isValidSteamId = (steamId) => {
  return /^\d{17}$/.test(
    String(steamId || "").trim()
  );
};

const getSteamApiKey = () => {
  const apiKey = process.env.STEAM_API_KEY;

  if (!apiKey) {
    const error = new Error(
      "Steam API key is not configured."
    );

    error.status = 500;
    throw error;
  }

  return apiKey;
};

const fetchJson = async (url) => {
  let response;

  try {
    response = await fetch(url);
  } catch (error) {
    const connectionError = new Error(
      "Could not connect to Steam."
    );

    connectionError.status = 503;
    throw connectionError;
  }

  let data = {};

  try {
    data = await response.json();
  } catch (error) {
    const responseError = new Error(
      "Steam returned an invalid response."
    );

    responseError.status = 502;
    throw responseError;
  }

  if (!response.ok) {
    const steamError = new Error(
      "Steam could not process the request."
    );

    steamError.status = response.status;
    throw steamError;
  }

  return data;
};

const getSteamPlayer = async (steamId) => {
  const apiKey = getSteamApiKey();

  const url =
    `${STEAM_API_BASE}` +
    "/ISteamUser/GetPlayerSummaries/v2/" +
    `?key=${encodeURIComponent(apiKey)}` +
    `&steamids=${encodeURIComponent(steamId)}`;

  const data = await fetchJson(url);

  const players =
    data?.response?.players || [];

  if (players.length === 0) {
    const error = new Error(
      "Steam account was not found."
    );

    error.status = 404;
    throw error;
  }

  return players[0];
};

const formatSteamData = (player) => {
  return {
    steamId:
      player.steamid || "",

    steamName:
      player.personaname || "",

    steamAvatar:
      player.avatar || "",

    steamAvatarMedium:
      player.avatarmedium || "",

    steamAvatarFull:
      player.avatarfull || "",

    steamProfileUrl:
      player.profileurl || "",

    steamVisibilityState:
      player.personastate || 0,

    steamCommunityVisibilityState:
      player.communityvisibilitystate || 0,

    steamLastLogoff:
      player.lastlogoff
        ? new Date(player.lastlogoff * 1000)
        : null
  };
};

const connectSteam = async (req, res) => {
  try {
    const steamId = String(
      req.body.steamId || ""
    ).trim();

    if (!steamId) {
      return res.status(400).json({
        message: "Steam ID is required."
      });
    }

    if (!isValidSteamId(steamId)) {
      return res.status(400).json({
        message:
          "Steam ID must contain exactly 17 numbers."
      });
    }

    const existingUser =
      await User.findOne({
        steamId,
        _id: {
          $ne: req.user._id
        }
      });

    if (existingUser) {
      return res.status(409).json({
        message:
          "This Steam account is already connected to another user."
      });
    }

    const player =
      await getSteamPlayer(steamId);

    const steamData =
      formatSteamData(player);

    const user =
      await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User was not found."
      });
    }

    user.steamId =
      steamData.steamId;

    user.steamName =
      steamData.steamName;

    user.steamAvatar =
      steamData.steamAvatar;

    user.steamAvatarMedium =
      steamData.steamAvatarMedium;

    user.steamAvatarFull =
      steamData.steamAvatarFull;

    user.steamProfileUrl =
      steamData.steamProfileUrl;

    user.steamVisibilityState =
      steamData.steamVisibilityState;

    user.steamCommunityVisibilityState =
      steamData.steamCommunityVisibilityState;

    user.steamLastLogoff =
      steamData.steamLastLogoff;

    user.steamConnectedAt =
      user.steamConnectedAt || new Date();

    user.steamLastSyncedAt =
      new Date();

    await user.save();

    return res.status(200).json({
      message:
        "Steam account connected successfully.",

      steam: {
        steamId:
          user.steamId,

        steamName:
          user.steamName,

        steamAvatar:
          user.steamAvatar,

        steamAvatarMedium:
          user.steamAvatarMedium,

        steamAvatarFull:
          user.steamAvatarFull,

        steamProfileUrl:
          user.steamProfileUrl,

        communityVisibilityState:
          user.steamCommunityVisibilityState,

        isPublic:
          user.steamCommunityVisibilityState === 3,

        connectedAt:
          user.steamConnectedAt,

        lastSyncedAt:
          user.steamLastSyncedAt
      }
    });
  } catch (error) {
    console.error(
      "Connect Steam error:",
      error.message
    );

    return res
      .status(error.status || 500)
      .json({
        message:
          error.message ||
          "Could not connect Steam account."
      });
  }
};

const getSteamProfile = async (
  req,
  res
) => {
  try {
    const user =
      await User.findById(req.user._id)
        .select(
          [
            "steamId",
            "steamName",
            "steamAvatar",
            "steamAvatarMedium",
            "steamAvatarFull",
            "steamProfileUrl",
            "steamVisibilityState",
            "steamCommunityVisibilityState",
            "steamConnectedAt",
            "steamLastSyncedAt"
          ].join(" ")
        );

    if (!user) {
      return res.status(404).json({
        message: "User was not found."
      });
    }

    if (!user.steamId) {
      return res.status(404).json({
        message:
          "No Steam account is connected."
      });
    }

    return res.status(200).json({
      steam: {
        steamId:
          user.steamId,

        steamName:
          user.steamName,

        steamAvatar:
          user.steamAvatar,

        steamAvatarMedium:
          user.steamAvatarMedium,

        steamAvatarFull:
          user.steamAvatarFull,

        steamProfileUrl:
          user.steamProfileUrl,

        communityVisibilityState:
          user.steamCommunityVisibilityState,

        isPublic:
          user.steamCommunityVisibilityState === 3,

        connectedAt:
          user.steamConnectedAt,

        lastSyncedAt:
          user.steamLastSyncedAt
      }
    });
  } catch (error) {
    console.error(
      "Get Steam profile error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Could not load Steam profile."
    });
  }
};

const refreshSteamProfile = async (
  req,
  res
) => {
  try {
    const user =
      await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User was not found."
      });
    }

    if (!user.steamId) {
      return res.status(400).json({
        message:
          "Connect a Steam account first."
      });
    }

    const player =
      await getSteamPlayer(
        user.steamId
      );

    const steamData =
      formatSteamData(player);

    user.steamName =
      steamData.steamName;

    user.steamAvatar =
      steamData.steamAvatar;

    user.steamAvatarMedium =
      steamData.steamAvatarMedium;

    user.steamAvatarFull =
      steamData.steamAvatarFull;

    user.steamProfileUrl =
      steamData.steamProfileUrl;

    user.steamVisibilityState =
      steamData.steamVisibilityState;

    user.steamCommunityVisibilityState =
      steamData.steamCommunityVisibilityState;

    user.steamLastLogoff =
      steamData.steamLastLogoff;

    user.steamLastSyncedAt =
      new Date();

    await user.save();

    return res.status(200).json({
      message:
        "Steam profile refreshed successfully.",

      steam: {
        steamId:
          user.steamId,

        steamName:
          user.steamName,

        steamAvatar:
          user.steamAvatar,

        steamAvatarMedium:
          user.steamAvatarMedium,

        steamAvatarFull:
          user.steamAvatarFull,

        steamProfileUrl:
          user.steamProfileUrl,

        communityVisibilityState:
          user.steamCommunityVisibilityState,

        isPublic:
          user.steamCommunityVisibilityState === 3,

        connectedAt:
          user.steamConnectedAt,

        lastSyncedAt:
          user.steamLastSyncedAt
      }
    });
  } catch (error) {
    console.error(
      "Refresh Steam profile error:",
      error.message
    );

    return res
      .status(error.status || 500)
      .json({
        message:
          error.message ||
          "Could not refresh Steam profile."
      });
  }
};

const disconnectSteam = async (
  req,
  res
) => {
  try {
    const user =
      await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User was not found."
      });
    }

    user.steamId = "";
    user.steamName = "";
    user.steamAvatar = "";
    user.steamAvatarMedium = "";
    user.steamAvatarFull = "";
    user.steamProfileUrl = "";
    user.steamVisibilityState = 0;
    user.steamCommunityVisibilityState = 0;
    user.steamLastLogoff = null;
    user.steamConnectedAt = null;
    user.steamLastSyncedAt = null;

    user.gamesTracked = 0;
    user.totalAchievements = 0;
    user.achievementsUnlocked = 0;
    user.achievementXP = 0;
    user.level = 1;
    user.completionPercentage = 0;

    await user.save();

    return res.status(200).json({
      message:
        "Steam account disconnected successfully."
    });
  } catch (error) {
    console.error(
      "Disconnect Steam error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Could not disconnect Steam account."
    });
  }
};

module.exports = {
  connectSteam,
  getSteamProfile,
  refreshSteamProfile,
  disconnectSteam
};
