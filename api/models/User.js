const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
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
            required: true
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
        steamProfileUrl: {
            type: String,
            default: ""
        },
        avatar: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);
