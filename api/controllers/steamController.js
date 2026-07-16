const User = require("../models/User");

const steamRequest = async (endpoint, params = {}) => {
    const apiKey = process.env.STEAM_API_KEY;

    if (!apiKey) {
        throw new Error("STEAM_API_KEY is missing from api/.env");
    }

    const query = new URLSearchParams({
        key: apiKey,
        format: "json",
        ...params
    });

    const response = await fetch(
        `https://api.steampowered.com/${endpoint}?${query.toString()}`
    );

    if (!response.ok) {
        throw new Error(`Steam API request failed with status ${response.status}`);
    }

    return response.json();
};

const connectSteam = async (req, res) => {
    try {
        const steamId = String(req.body.steamId || "").trim();

        if (!/^\d{17}$/.test(steamId)) {
            return res.status(400).json({
                message: "Enter a valid 17-digit Steam ID."
            });
        }

        const data = await steamRequest(
            "ISteamUser/GetPlayerSummaries/v2/",
            {
                steamids: steamId
            }
        );

        const player = data?.response?.players?.[0];

        if (!player) {
            return res.status(404).json({
                message: "Steam profile was not found."
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        user.steamId = player.steamid;
        user.steamName = player.personaname || "";
        user.steamAvatar = player.avatarfull || "";
        user.steamProfileUrl = player.profileurl || "";

        await user.save();

        res.json({
            message: "Steam account connected.",
            steam: {
                steamId: user.steamId,
                steamName: user.steamName,
                steamAvatar: user.steamAvatar,
                steamProfileUrl: user.steamProfileUrl
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getSteamProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        if (!user.steamId) {
            return res.status(400).json({
                message: "No Steam account is connected."
            });
        }

        const data = await steamRequest(
            "ISteamUser/GetPlayerSummaries/v2/",
            {
                steamids: user.steamId
            }
        );

        const player = data?.response?.players?.[0];

        if (!player) {
            return res.status(404).json({
                message: "Steam profile was not found."
            });
        }

        res.json({
            steamId: player.steamid,
            steamName: player.personaname,
            steamAvatar: player.avatarfull,
            steamProfileUrl: player.profileurl,
            visibilityState: player.communityvisibilitystate
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getOwnedGames = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");

        if (!user?.steamId) {
            return res.status(400).json({
                message: "Connect a Steam account first."
            });
        }

        const data = await steamRequest(
            "IPlayerService/GetOwnedGames/v1/",
            {
                steamid: user.steamId,
                include_appinfo: "true",
                include_played_free_games: "true"
            }
        );

        const games = data?.response?.games || [];

        const formattedGames = games.map((game) => ({
            appId: game.appid,
            name: game.name,
            playtimeMinutes: game.playtime_forever || 0,
            playtimeHours: Math.round((game.playtime_forever || 0) / 60),
            iconUrl: game.img_icon_url
                ? `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`
                : "",
            headerImage: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`
        }));

        res.json({
            gameCount: formattedGames.length,
            games: formattedGames
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    connectSteam,
    getSteamProfile,
    getOwnedGames
};
