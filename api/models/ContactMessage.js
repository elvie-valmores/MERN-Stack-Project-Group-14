const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema(
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
            trim: true,
            lowercase: true,
            maxlength: 120
        },

        subject: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },

        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        },

        status: {
            type: String,
            enum: ["new", "read", "resolved"],
            default: "new"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "ContactMessage",
    contactMessageSchema
);
