const mongoose = require("mongoose");

const steamAchievementSchema =
  new mongoose.Schema(
    {
      user: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
      },

      game: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "SteamGame",
        required: true,
        index: true
      },

      appId: {
        type: Number,
        required: true,
        index: true
      },

      apiName: {
        type: String,
        required: true,
        trim: true
      },

      displayName: {
        type: String,
        default: "",
        trim: true
      },

      description: {
        type: String,
        default: "",
        trim: true
      },

      icon: {
        type: String,
        default: ""
      },

      iconGray: {
        type: String,
        default: ""
      },

      hidden: {
        type: Boolean,
        default: false
      },

      achieved: {
        type: Boolean,
        default: false,
        index: true
      },

      unlockTime: {
        type: Date,
        default: null
      },

      xpValue: {
        type: Number,
        default: 100,
        min: 0
      },

      lastSyncedAt: {
        type: Date,
        default: Date.now
      }
    },
    {
      timestamps: true
    }
  );

steamAchievementSchema.index(
  {
    user: 1,
    appId: 1,
    apiName: 1
  },
  {
    unique: true
  }
);

steamAchievementSchema.index({
  user: 1,
  achieved: 1,
  unlockTime: -1
});

steamAchievementSchema.index({
  game: 1,
  achieved: 1
});

steamAchievementSchema.index({
  user: 1,
  displayName: 1
});

module.exports = mongoose.model(
  "SteamAchievement",
  steamAchievementSchema
);
