const User = require("../models/User");

const getLeaderboard = async (req, res) => {
    try {
        const users = await User.find({})
            .select(
                "name achievementXP achievementsUnlocked totalAchievements completionPercentage level steamAvatar"
            )
            .sort({
                achievementXP: -1,
                achievementsUnlocked: -1,
                createdAt: 1
            });

        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            _id: user._id,
            name: user.name,
            achievementXP: user.achievementXP || 0,
            achievementsUnlocked:
                user.achievementsUnlocked || 0,
            totalAchievements:
                user.totalAchievements || 0,
            completionPercentage:
                user.completionPercentage || 0,
            level: user.level || 1,
            steamAvatar: user.steamAvatar || ""
        }));

        res.json({
            count: leaderboard.length,
            leaderboard
        });
    } catch (error) {
        res.status(500).json({
            message: "Could not load leaderboard."
        });
    }
};

module.exports = {
    getLeaderboard
};
