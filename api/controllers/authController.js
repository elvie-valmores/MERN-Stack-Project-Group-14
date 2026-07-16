const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const makeToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
    );
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            steamId: user.steamId,
            steamName: user.steamName,
            steamAvatar: user.steamAvatar,
            createdAt: user.createdAt,
            token: makeToken(user._id)
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            steamId: user.steamId,
            steamName: user.steamName,
            steamAvatar: user.steamAvatar,
            createdAt: user.createdAt,
            token: makeToken(user._id)
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getProfile = async (req, res) => {
    try {
        res.json({
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            steamId: req.user.steamId,
            steamName: req.user.steamName,
            steamAvatar: req.user.steamAvatar,
            steamProfileUrl: req.user.steamProfileUrl,
            avatar: req.user.avatar,
            createdAt: req.user.createdAt
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (
            req.body.email &&
            req.body.email !== user.email
        ) {
            const emailExists = await User.findOne({
                email: req.body.email
            });

            if (emailExists) {
                return res.status(400).json({
                    message: "Email is already being used"
                });
            }
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if (req.body.steamId !== undefined) {
            user.steamId = String(req.body.steamId).trim();
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            steamId: updatedUser.steamId,
            steamName: updatedUser.steamName,
            steamAvatar: updatedUser.steamAvatar,
            steamProfileUrl: updatedUser.steamProfileUrl,
            avatar: updatedUser.avatar,
            createdAt: updatedUser.createdAt,
            token: makeToken(updatedUser._id)
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getProfile,
    updateProfile
};
