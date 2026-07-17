const mongoose = require("mongoose");

const steamGameSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    appId: {
      type: Number,
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    playtimeForever: {
      type: Number,
      default: 0,
      min: 0
    },

    playtimeWindows: {
      type: Number,
      default: 0,
      min: 0
    },

    playtimeMac: {
      type: Number,
      default: 0,
      min: 0
    },

    playtimeLinux: {
      type: Number,
      default: 0,
      min: 0
    },

    playtimeDeck: {
      type: Number,
      default: 0,
      min: 0
    },

    playtimeTwoWeeks: {
      type: Number,
      default: 0,
      min: 0
    },

    iconHash: {
      type: String,
      default: ""
    },

    headerImage: {
      type: String,
      default: ""
    },

    iconUrl: {
      type: String,
      default: ""
    },

    storeUrl: {
      type: String,
      default: ""
    },

    totalAchievements: {
      type: Number,
      default: 0,
      min: 0
    },

    achievementsUnlocked: {
      type: Number,
      default: 0,
      min: 0
    },

    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    achievementsSupported: {
      type: Boolean,
      default: false
    },

    lastPlayedAt: {
      type: Date,
      default: null
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

steamGameSchema.index(
  {
    user: 1,
    appId: 1
  },
  {
    unique: true
  }
);

steamGameSchema.index({
  user: 1,
  name: 1
});

steamGameSchema.index({
  user: 1,
  playtimeForever: -1
});

module.exports = mongoose.model(
  "SteamGame",
  steamGameSchema
);
