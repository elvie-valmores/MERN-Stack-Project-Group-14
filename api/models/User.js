const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      minlength: 8
    },

    avatar: {
      type: String,
      default: ""
    },

    steamId: {
      type: String,
      default: "",
      trim: true
    },

    steamName: {
      type: String,
      default: ""
    },

    steamAvatar: {
      type: String,
      default: ""
    },

    steamAvatarMedium: {
      type: String,
      default: ""
    },

    steamAvatarFull: {
      type: String,
      default: ""
    },

    steamProfileUrl: {
      type: String,
      default: ""
    },

    steamVisibilityState: {
      type: Number,
      default: 0
    },

    steamCommunityVisibilityState: {
      type: Number,
      default: 0
    },

    steamLastLogoff: {
      type: Date,
      default: null
    },

    steamConnectedAt: {
      type: Date,
      default: null
    },

    steamLastSyncedAt: {
      type: Date,
      default: null
    },

    gamesTracked: {
      type: Number,
      default: 0,
      min: 0
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

    achievementXP: {
      type: Number,
      default: 0,
      min: 0
    },

    level: {
      type: Number,
      default: 1,
      min: 1
    },

    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "User",
  userSchema
);
