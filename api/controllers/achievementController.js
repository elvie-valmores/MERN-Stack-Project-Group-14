const User = require("../models/User");
const SteamGame = require("../models/SteamGame");
const SteamAchievement = require(
  "../models/SteamAchievement"
);

const STEAM_API_BASE =
  "https://api.steampowered.com";

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

const getPlayerAchievements = async (
  steamId,
  appId
) => {
  const apiKey =
    getSteamApiKey();

  const url =
    `${STEAM_API_BASE}` +
    "/ISteamUserStats/GetPlayerAchievements/v1/" +
    `?key=${encodeURIComponent(apiKey)}` +
    `&steamid=${encodeURIComponent(steamId)}` +
    `&appid=${encodeURIComponent(appId)}` +
    "&l=english";

  const data =
    await fetchJson(url);

  return data?.playerstats || {};
};

const getGameSchema = async (
  appId
) => {
  const apiKey =
    getSteamApiKey();

  const url =
    `${STEAM_API_BASE}` +
    "/ISteamUserStats/GetSchemaForGame/v2/" +
    `?key=${encodeURIComponent(apiKey)}` +
    `&appid=${encodeURIComponent(appId)}` +
    "&l=english";

  const data =
    await fetchJson(url);

  return (
    data?.game?.availableGameStats
      ?.achievements || []
  );
};

const getLevelFromXP = (xp) => {
  return Math.max(
    1,
    Math.floor((xp || 0) / 1000) + 1
  );
};

const calculatePercentage = (
  unlocked,
  total
) => {
  if (!total) {
    return 0;
  }

  return Math.round(
    (unlocked / total) * 100
  );
};

const formatAchievement = (
  achievement
) => {
  return {
    _id:
      achievement._id,

    appId:
      achievement.appId,

    apiName:
      achievement.apiName,

    displayName:
      achievement.displayName,

    description:
      achievement.description,

    icon:
      achievement.icon,

    iconGray:
      achievement.iconGray,

    hidden:
      achievement.hidden,

    achieved:
      achievement.achieved,

    unlockTime:
      achievement.unlockTime,

    xpValue:
      achievement.xpValue,

    game:
      achievement.game
        ? {
            _id:
              achievement.game._id,

            appId:
              achievement.game.appId,

            name:
              achievement.game.name,

            headerImage:
              achievement.game.headerImage
          }
        : null
  };
};

const updateUserStatistics = async (
  userId
) => {
  const games =
    await SteamGame.find({
      user: userId
    }).lean();

  const achievements =
    await SteamAchievement.find({
      user: userId
    }).lean();

  const totalAchievements =
    achievements.length;

  const achievementsUnlocked =
    achievements.filter(
      (achievement) =>
        achievement.achieved
    ).length;

  const achievementXP =
    achievements
      .filter(
        (achievement) =>
          achievement.achieved
      )
      .reduce(
        (total, achievement) =>
          total +
          (achievement.xpValue || 0),
        0
      );

  const completionPercentage =
    calculatePercentage(
      achievementsUnlocked,
      totalAchievements
    );

  const level =
    getLevelFromXP(
      achievementXP
    );

  await User.findByIdAndUpdate(
    userId,
    {
      gamesTracked:
        games.length,

      totalAchievements,

      achievementsUnlocked,

      achievementXP,

      level,

      completionPercentage,

      steamLastSyncedAt:
        new Date()
    }
  );

  return {
    gamesTracked:
      games.length,

    totalAchievements,

    achievementsUnlocked,

    achievementXP,

    level,

    completionPercentage
  };
};

const syncGameAchievements = async (
  user,
  game
) => {
  let playerStats;
  let schemaAchievements;

  try {
    playerStats =
      await getPlayerAchievements(
        user.steamId,
        game.appId
      );

    schemaAchievements =
      await getGameSchema(
        game.appId
      );
  } catch (error) {
    if (
      error.status === 400 ||
      error.status === 403 ||
      error.status === 404
    ) {
      await SteamAchievement.deleteMany({
        user:
          user._id,

        appId:
          game.appId
      });

      game.totalAchievements = 0;
      game.achievementsUnlocked = 0;
      game.completionPercentage = 0;
      game.achievementsSupported = false;
      game.lastSyncedAt = new Date();

      await game.save();

      return {
        appId:
          game.appId,

        gameName:
          game.name,

        supported:
          false,

        totalAchievements:
          0,

        achievementsUnlocked:
          0
      };
    }

    throw error;
  }

  const playerAchievements =
    playerStats.achievements || [];

  if (
    playerStats.success === false ||
    (
      playerAchievements.length === 0 &&
      schemaAchievements.length === 0
    )
  ) {
    await SteamAchievement.deleteMany({
      user:
        user._id,

      appId:
        game.appId
    });

    game.totalAchievements = 0;
    game.achievementsUnlocked = 0;
    game.completionPercentage = 0;
    game.achievementsSupported = false;
    game.lastSyncedAt = new Date();

    await game.save();

    return {
      appId:
        game.appId,

      gameName:
        game.name,

      supported:
        false,

      totalAchievements:
        0,

      achievementsUnlocked:
        0
    };
  }

  const playerMap =
    new Map();

  playerAchievements.forEach(
    (achievement) => {
      playerMap.set(
        achievement.apiname,
        achievement
      );
    }
  );

  const schemaMap =
    new Map();

  schemaAchievements.forEach(
    (achievement) => {
      schemaMap.set(
        achievement.name,
        achievement
      );
    }
  );

  const names =
    new Set([
      ...playerMap.keys(),
      ...schemaMap.keys()
    ]);

  const syncTime =
    new Date();

  const operations =
    [...names].map((apiName) => {
      const playerAchievement =
        playerMap.get(apiName) || {};

      const schemaAchievement =
        schemaMap.get(apiName) || {};

      const achieved =
        Number(
          playerAchievement.achieved || 0
        ) === 1;

      const unlockTime =
        achieved &&
        playerAchievement.unlocktime
          ? new Date(
              playerAchievement.unlocktime *
                1000
            )
          : null;

      return {
        updateOne: {
          filter: {
            user:
              user._id,

            appId:
              game.appId,

            apiName
          },

          update: {
            $set: {
              game:
                game._id,

              displayName:
                schemaAchievement.displayName ||
                playerAchievement.name ||
                apiName,

              description:
                schemaAchievement.description ||
                "",

              icon:
                schemaAchievement.icon ||
                "",

              iconGray:
                schemaAchievement.icongray ||
                "",

              hidden:
                Boolean(
                  Number(
                    schemaAchievement.hidden ||
                    0
                  )
                ),

              achieved,

              unlockTime,

              xpValue:
                100,

              lastSyncedAt:
                syncTime
            },

            $setOnInsert: {
              user:
                user._id,

              appId:
                game.appId,

              apiName
            }
          },

          upsert: true
        }
      };
    });

  if (operations.length > 0) {
    await SteamAchievement.bulkWrite(
      operations
    );
  }

  await SteamAchievement.deleteMany({
    user:
      user._id,

    appId:
      game.appId,

    apiName: {
      $nin:
        [...names]
    }
  });

  const totalAchievements =
    names.size;

  const achievementsUnlocked =
    playerAchievements.filter(
      (achievement) =>
        Number(
          achievement.achieved || 0
        ) === 1
    ).length;

  game.totalAchievements =
    totalAchievements;

  game.achievementsUnlocked =
    achievementsUnlocked;

  game.completionPercentage =
    calculatePercentage(
      achievementsUnlocked,
      totalAchievements
    );

  game.achievementsSupported =
    totalAchievements > 0;

  game.lastSyncedAt =
    syncTime;

  await game.save();

  return {
    appId:
      game.appId,

    gameName:
      game.name,

    supported:
      totalAchievements > 0,

    totalAchievements,

    achievementsUnlocked,

    completionPercentage:
      game.completionPercentage
  };
};

const syncAchievements = async (
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

    const games =
      await SteamGame.find({
        user:
          user._id
      }).sort({
        playtimeForever: -1
      });

    if (games.length === 0) {
      return res.status(400).json({
        message:
          "Import your Steam games before synchronizing achievements."
      });
    }

    const results = [];

    for (const game of games) {
      try {
        const result =
          await syncGameAchievements(
            user,
            game
          );

        results.push(result);
      } catch (error) {
        console.error(
          `Achievement sync failed for ${game.name}:`,
          error.message
        );

        results.push({
          appId:
            game.appId,

          gameName:
            game.name,

          supported:
            false,

          error:
            error.message
        });
      }
    }

    const statistics =
      await updateUserStatistics(
        user._id
      );

    const supportedGames =
      results.filter(
        (result) =>
          result.supported
      ).length;

    return res.status(200).json({
      message:
        `Achievements synchronized for ${supportedGames} games.`,

      gameCount:
        games.length,

      supportedGames,

      results,

      statistics
    });
  } catch (error) {
    console.error(
      "Sync achievements error:",
      error.message
    );

    return res
      .status(error.status || 500)
      .json({
        message:
          error.message ||
          "Could not synchronize achievements."
      });
  }
};

const syncSingleGameAchievements = async (
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

    const game =
      await SteamGame.findOne({
        user:
          user._id,

        appId
      });

    if (!game) {
      return res.status(404).json({
        message:
          "Game was not found in your library."
      });
    }

    const result =
      await syncGameAchievements(
        user,
        game
      );

    const statistics =
      await updateUserStatistics(
        user._id
      );

    return res.status(200).json({
      message:
        result.supported
          ? `${game.name} achievements synchronized.`
          : `${game.name} does not have accessible achievements.`,

      result,

      statistics
    });
  } catch (error) {
    console.error(
      "Sync game achievements error:",
      error.message
    );

    return res
      .status(error.status || 500)
      .json({
        message:
          error.message ||
          "Could not synchronize game achievements."
      });
  }
};

const getAchievements = async (
  req,
  res
) => {
  try {
    const search =
      String(
        req.query.search || ""
      ).trim();

    const status =
      String(
        req.query.status || "all"
      );

    const appId =
      req.query.appId
        ? Number(req.query.appId)
        : null;

    const query = {
      user:
        req.user._id
    };

    if (status === "unlocked") {
      query.achieved = true;
    }

    if (status === "locked") {
      query.achieved = false;
    }

    if (
      appId &&
      Number.isInteger(appId)
    ) {
      query.appId = appId;
    }

    if (search) {
      query.$or = [
        {
          displayName: {
            $regex:
              search,

            $options:
              "i"
          }
        },
        {
          description: {
            $regex:
              search,

            $options:
              "i"
          }
        }
      ];
    }

    const achievements =
      await SteamAchievement.find(
        query
      )
        .populate(
          "game",
          "appId name headerImage"
        )
        .sort({
          achieved: -1,
          unlockTime: -1,
          displayName: 1
        })
        .lean();

    const allAchievements =
      await SteamAchievement.find({
        user:
          req.user._id
      })
        .select(
          "achieved xpValue"
        )
        .lean();

    const totalAchievements =
      allAchievements.length;

    const achievementsUnlocked =
      allAchievements.filter(
        (achievement) =>
          achievement.achieved
      ).length;

    const achievementXP =
      allAchievements
        .filter(
          (achievement) =>
            achievement.achieved
        )
        .reduce(
          (total, achievement) =>
            total +
            (achievement.xpValue || 0),
          0
        );

    return res.status(200).json({
      totalAchievements,

      achievementsUnlocked,

      achievementsLocked:
        totalAchievements -
        achievementsUnlocked,

      achievementXP,

      completionPercentage:
        calculatePercentage(
          achievementsUnlocked,
          totalAchievements
        ),

      achievements:
        achievements.map(
          formatAchievement
        )
    });
  } catch (error) {
    console.error(
      "Get achievements error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Could not load achievements."
    });
  }
};

const getGameAchievements = async (
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

    const achievements =
      await SteamAchievement.find({
        user:
          req.user._id,

        appId
      })
        .sort({
          achieved: -1,
          unlockTime: -1,
          displayName: 1
        })
        .lean();

    return res.status(200).json({
      game: {
        _id:
          game._id,

        appId:
          game.appId,

        name:
          game.name,

        headerImage:
          game.headerImage,

        iconUrl:
          game.iconUrl,

        storeUrl:
          game.storeUrl,

        playtimeForever:
          game.playtimeForever,

        playtimeHours:
          Math.round(
            (
              (game.playtimeForever || 0) /
              60
            ) * 10
          ) / 10,

        totalAchievements:
          game.totalAchievements,

        achievementsUnlocked:
          game.achievementsUnlocked,

        completionPercentage:
          game.completionPercentage,

        achievementsSupported:
          game.achievementsSupported
      },

      achievements:
        achievements.map(
          formatAchievement
        )
    });
  } catch (error) {
    console.error(
      "Get game achievements error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Could not load game achievements."
    });
  }
};

module.exports = {
  syncAchievements,
  syncSingleGameAchievements,
  getAchievements,
  getGameAchievements
};
