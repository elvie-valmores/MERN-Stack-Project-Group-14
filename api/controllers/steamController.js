const User = require("../models/User");
const SteamGame = require("../models/SteamGame");

const STEAM_API_BASE =
  "https://api.steampowered.com";

const STEAM_IMAGE_BASE =
  "https://cdn.akamai.steamstatic.com/steam/apps";

const isValidSteamId = (steamId) => {
  return /^\d{17}$/.test(
    String(steamId || "").trim()
  );
};

const getSteamApiKey = () => {
  const apiKey =
    process.env.STEAM_API_KEY;

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
    const connectionError =
      new Error(
        "Could not connect to Steam."
      );

    connectionError.status = 503;
    throw connectionError;
  }

  let data = {};

  try {
    data = await response.json();
  } catch (error) {
    const responseError =
      new Error(
        "Steam returned an invalid response."
      );

    responseError.status = 502;
    throw responseError;
  }

  if (!response.ok) {
    const steamError =
      new Error(
        "Steam could not process the request."
      );

    steamError.status =
      response.status;

    throw steamError;
  }

  return data;
};

const getSteamPlayer = async (
  steamId
) => {
  const apiKey =
    getSteamApiKey();

  const url =
    `${STEAM_API_BASE}` +
    "/ISteamUser/GetPlayerSummaries/v2/" +
    `?key=${encodeURIComponent(apiKey)}` +
    `&steamids=${encodeURIComponent(steamId)}`;

  const data =
    await fetchJson(url);

  const players =
    data?.response?.players || [];

  if (players.length === 0) {
    const error =
      new Error(
        "Steam account was not found."
      );

    error.status = 404;
    throw error;
  }

  return players[0];
};

const getOwnedGamesFromSteam = async (
  steamId
) => {
  const apiKey =
    getSteamApiKey();

  const url =
    `${STEAM_API_BASE}` +
    "/IPlayerService/GetOwnedGames/v1/" +
    `?key=${encodeURIComponent(apiKey)}` +
    `&steamid=${encodeURIComponent(steamId)}` +
    "&include_appinfo=true" +
    "&include_played_free_games=true" +
    "&format=json";

  const data =
    await fetchJson(url);

  return {
    gameCount:
      data?.response?.game_count || 0,

    games:
      data?.response?.games || []
  };
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
        ? new Date(
            player.lastlogoff * 1000
          )
        : null
  };
};

const buildHeaderImage = (appId) => {
  return (
    `${STEAM_IMAGE_BASE}/` +
    `${appId}/header.jpg`
  );
};

const buildIconUrl = (
  appId,
  iconHash
) => {
  if (!iconHash) {
    return "";
  }

  return (
    "https://media.steampowered.com/" +
    `steamcommunity/public/images/apps/` +
    `${appId}/${iconHash}.jpg`
  );
};

const buildStoreUrl = (appId) => {
  return (
    "https://store.steampowered.com/" +
    `app/${appId}`
  );
};

const minutesToHours = (minutes) => {
  return Math.round(
    ((minutes || 0) / 60) * 10
  ) / 10;
};

const formatGameForResponse = (
  game
) => {
  return {
    _id:
      game._id,

    appId:
      game.appId,

    name:
      game.name,

    playtimeForever:
      game.playtimeForever || 0,

    playtimeHours:
      minutesToHours(
        game.playtimeForever
      ),

    playtimeTwoWeeks:
      game.playtimeTwoWeeks || 0,

    playtimeTwoWeeksHours:
      minutesToHours(
        game.playtimeTwoWeeks
      ),

    playtimeWindows:
      game.playtimeWindows || 0,

    playtimeMac:
      game.playtimeMac || 0,

    playtimeLinux:
      game.playtimeLinux || 0,

    playtimeDeck:
      game.playtimeDeck || 0,

    iconUrl:
      game.iconUrl || "",

    headerImage:
      game.headerImage || "",

    storeUrl:
      game.storeUrl || "",

    totalAchievements:
      game.totalAchievements || 0,

    achievementsUnlocked:
      game.achievementsUnlocked || 0,

    completionPercentage:
      game.completionPercentage || 0,

    achievementsSupported:
      game.achievementsSupported || false,

    lastPlayedAt:
      game.lastPlayedAt,

    lastSyncedAt:
      game.lastSyncedAt
  };
};

const connectSteam = async (
  req,
  res
) => {
  try {
    const steamId = String(
      req.body.steamId || ""
    ).trim();

    if (!steamId) {
      return res.status(400).json({
        message:
          "Steam ID is required."
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
      await User.findById(
        req.user._id
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User was not found."
      });
    }

    const steamIdChanged =
      user.steamId &&
      user.steamId !== steamData.steamId;

    if (steamIdChanged) {
      await SteamGame.deleteMany({
        userId: user._id
      });

      user.totalGames = 0;
      user.totalAchievements = 0;
      user.unlockedAchievements = 0;
      user.achievementXp = 0;
      user.level = 1;
      user.completionPercentage = 0;
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
      user.steamConnectedAt ||
      new Date();

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
          user.steamCommunityVisibilityState ===
          3,

        connectedAt:
          user.steamConnectedAt,

        lastSyncedAt:
          user.steamLastSyncedAt
      }
    });
  } catch (error) {
    console.error("========== STEAM ERROR ==========");
    console.error("Status:", error.response?.status);
    console.error("Response:", error.response?.data);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    console.error("=================================");

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
      await User.findById(
        req.user._id
      ).select(
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
        message:
          "User was not found."
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
          user.steamCommunityVisibilityState ===
          3,

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
      await User.findById(
        req.user._id
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User was not found."
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
          user.steamCommunityVisibilityState ===
          3,

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

const syncOwnedGames = async (
  req,
  res
) => {
  try {
    const user =
      await User.findById(
        req.user._id
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User was not found."
      });
    }

    if (!user.steamId) {
      return res.status(400).json({
        message:
          "Connect a Steam account first."
      });
    }

    const result =
      await getOwnedGamesFromSteam(
        user.steamId
      );

    const steamGames =
      result.games || [];

    if (
      result.gameCount === 0 &&
      steamGames.length === 0
    ) {
      return res.status(403).json({
        message:
          "Steam did not return any games. Make sure your Steam profile and Game Details are public."
      });
    }

    const syncTime =
      new Date();

    const currentAppIds =
      steamGames.map(
        (game) => game.appid
      );

    const operations =
      steamGames.map((game) => {
        const lastPlayedAt =
          game.rtime_last_played
            ? new Date(
                game.rtime_last_played *
                  1000
              )
            : null;

        return {
          updateOne: {
            filter: {
              user:
                user._id,

              appId:
                game.appid
            },

            update: {
              $set: {
                name:
                  game.name ||
                  `Steam Game ${game.appid}`,

                playtimeForever:
                  game.playtime_forever ||
                  0,

                playtimeWindows:
                  game.playtime_windows_forever ||
                  0,

                playtimeMac:
                  game.playtime_mac_forever ||
                  0,

                playtimeLinux:
                  game.playtime_linux_forever ||
                  0,

                playtimeDeck:
                  game.playtime_deck_forever ||
                  0,

                playtimeTwoWeeks:
                  game.playtime_2weeks ||
                  0,

                iconHash:
                  game.img_icon_url ||
                  "",

                headerImage:
                  buildHeaderImage(
                    game.appid
                  ),

                iconUrl:
                  buildIconUrl(
                    game.appid,
                    game.img_icon_url
                  ),

                storeUrl:
                  buildStoreUrl(
                    game.appid
                  ),

                lastPlayedAt,

                lastSyncedAt:
                  syncTime
              },

              $setOnInsert: {
                user:
                  user._id,

                appId:
                  game.appid
              }
            },

            upsert: true
          }
        };
      });

    if (operations.length > 0) {
      await SteamGame.bulkWrite(
        operations
      );
    }

    await SteamGame.deleteMany({
      user:
        user._id,

      appId: {
        $nin:
          currentAppIds
      }
    });

    user.gamesTracked =
      steamGames.length;

    user.steamLastSyncedAt =
      syncTime;

    await user.save();

    const savedGames =
      await SteamGame.find({
        user:
          user._id
      })
        .sort({
          playtimeForever: -1,
          name: 1
        })
        .lean();

    return res.status(200).json({
      message:
        `${savedGames.length} Steam games synchronized successfully.`,

      gameCount:
        savedGames.length,

      games:
        savedGames.map(
          formatGameForResponse
        ),

      lastSyncedAt:
        syncTime
    });
  } catch (error) {
    console.error(
      "Sync owned games error:",
      error.message
    );

    return res
      .status(error.status || 500)
      .json({
        message:
          error.message ||
          "Could not synchronize Steam games."
      });
  }
};

const getOwnedGames = async (
  req,
  res
) => {
  try {
    const user =
      await User.findById(
        req.user._id
      ).select(
        "steamId steamLastSyncedAt"
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User was not found."
      });
    }

    const search =
      String(
        req.query.search || ""
      ).trim();

    const sort =
      String(
        req.query.sort || "playtime"
      );

    const query = {
      user:
        req.user._id
    };

    if (search) {
      query.name = {
        $regex:
          search,

        $options:
          "i"
      };
    }

    let sortOption = {
      playtimeForever: -1,
      name: 1
    };

    if (sort === "name") {
      sortOption = {
        name: 1
      };
    }

    if (sort === "recent") {
      sortOption = {
        lastPlayedAt: -1,
        name: 1
      };
    }

    if (sort === "completion") {
      sortOption = {
        completionPercentage: -1,
        name: 1
      };
    }

    const games =
      await SteamGame.find(query)
        .sort(sortOption)
        .lean();

    const totalPlaytimeMinutes =
      games.reduce(
        (total, game) =>
          total +
          (game.playtimeForever || 0),
        0
      );

    return res.status(200).json({
      connected:
        Boolean(user.steamId),

      gameCount:
        games.length,

      totalPlaytimeMinutes,

      totalPlaytimeHours:
        minutesToHours(
          totalPlaytimeMinutes
        ),

      lastSyncedAt:
        user.steamLastSyncedAt,

      games:
        games.map(
          formatGameForResponse
        )
    });
  } catch (error) {
    console.error(
      "Get owned games error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Could not load Steam games."
    });
  }
};

const getGameDetails = async (
  req,
  res
) => {
  try {
    const appId =
      Number(req.params.appId);

    if (
      !Number.isInteger(appId) ||
      appId <= 0
    ) {
      return res.status(400).json({
        message:
          "A valid Steam App ID is required."
      });
    }

    const game =
      await SteamGame.findOne({
        user:
          req.user._id,

        appId
      }).lean();

    if (!game) {
      return res.status(404).json({
        message:
          "Game was not found in your library."
      });
    }

    return res.status(200).json({
      game:
        formatGameForResponse(game)
    });
  } catch (error) {
    console.error(
      "Get game details error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Could not load game details."
    });
  }
};

const disconnectSteam = async (
  req,
  res
) => {
  try {
    const user =
      await User.findById(
        req.user._id
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User was not found."
      });
    }

    await SteamGame.deleteMany({
      user:
        user._id
    });

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
  syncOwnedGames,
  getOwnedGames,
  getGameDetails,
  disconnectSteam
};
