const crypto = require("crypto");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const sendEmail = require("../utils/sendEmail");

const makeToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

const makeVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const getVerificationUrl = (token) => {
  const apiUrl =
    process.env.API_URL ||
    `http://localhost:${process.env.PORT || 5050}`;

  return `${apiUrl}/api/auth/verify-email/${token}`;
};

const sendVerificationMessage = async (user) => {
  if (
    process.env.NODE_ENV === "test" ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS
  ) {
    console.log(
      "Verification email skipped because email credentials are not configured."
    );

    return false;
  }

  const verificationUrl = getVerificationUrl(
    user.verificationToken
  );

  await sendEmail({
    to: user.email,
    subject: "Verify your Achievement Hub account",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Welcome to Achievement Hub!</h2>

        <p>Hello ${user.name},</p>

        <p>
          Please verify your email address by clicking the button below.
        </p>

        <p>
          <a
            href="${verificationUrl}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background: #6f42c1;
              color: white;
              text-decoration: none;
              border-radius: 6px;
            "
          >
            Verify Email
          </a>
        </p>

        <p>This verification link expires in 24 hours.</p>

        <p>
          If the button does not work, copy this link:
        </p>

        <p>${verificationUrl}</p>
      </div>
    `,
  });

  return true;
};

const createUserResponse = (user) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    authProvider: user.authProvider,
    steamId: user.steamId,
    steamName: user.steamName,
    steamAvatar: user.steamAvatar,
    steamProfileUrl: user.steamProfileUrl,
    createdAt: user.createdAt,
    isVerified: user.isVerified,
    token: makeToken(user._id),
  };
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters.",
      });
    }

    const normalizedEmail = email
      .toLowerCase()
      .trim();

    const userExists = await User.findOne({
      email: normalizedEmail,
    });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const verificationToken =
      makeVerificationToken();

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      authProvider: "local",
      isVerified: false,
      verificationToken,
      verificationTokenExpires: new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ),
    });

    const verificationEmailSent =
      await sendVerificationMessage(user);

    res.status(201).json({
      ...createUserResponse(user),
      verificationEmailSent,
      message: verificationEmailSent
        ? "Account created. Please check your email to verify your account."
        : "Account created. Email credentials still need to be configured.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Please enter your email and password",
      });
    }

    const normalizedEmail = email
      .toLowerCase()
      .trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        message:
          "This account uses Google. Please log in with Google.",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (user.isVerified === false) {
      return res.status(403).json({
        message:
          "Please verify your email before logging in.",
        email: user.email,
      });
    }

    res.json(createUserResponse(user));
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message:
          "Google login credential is missing.",
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(503).json({
        message:
          "Google login is not configured yet.",
      });
    }

    const googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID
    );

    const ticket =
      await googleClient.verifyIdToken({
        idToken: credential,
        audience:
          process.env.GOOGLE_CLIENT_ID,
      });

    const payload = ticket.getPayload();

    if (
      !payload ||
      !payload.email ||
      !payload.email_verified
    ) {
      return res.status(401).json({
        message:
          "Google could not verify this email address.",
      });
    }

    const normalizedEmail = payload.email
      .toLowerCase()
      .trim();

    let user = await User.findOne({
      email: normalizedEmail,
    });

    if (user) {
      user.googleId = payload.sub;
      user.isVerified = true;
      user.verificationToken = "";
      user.verificationTokenExpires = null;

      if (!user.avatar && payload.picture) {
        user.avatar = payload.picture;
      }

      await user.save();
    } else {
      user = await User.create({
        name:
          payload.name ||
          payload.given_name ||
          "Google User",
        email: normalizedEmail,
        authProvider: "google",
        googleId: payload.sub,
        avatar: payload.picture || "",
        isVerified: true,
        verificationToken: "",
        verificationTokenExpires: null,
      });
    }

    res.status(200).json({
      ...createUserResponse(user),
      message: "Google login successful.",
    });
  } catch (error) {
    console.error(
      "Google login error:",
      error.message
    );

    res.status(401).json({
      message:
        "Google login failed. Please try again.",
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
      verificationTokenExpires: {
        $gt: new Date(),
      },
    });

    if (!user) {
      return res.status(400).send(`
        <div style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>Verification link is invalid or expired</h1>
          <p>Please request a new verification email.</p>
        </div>
      `);
    }

    user.isVerified = true;
    user.verificationToken = "";
    user.verificationTokenExpires = null;

    await user.save();

    const clientUrl =
      process.env.CLIENT_URL ||
      "http://localhost:5173";

    res.status(200).send(`
      <div style="font-family: Arial; text-align: center; padding: 50px;">
        <h1>Email verified successfully!</h1>
        <p>You can now log in to Achievement Hub.</p>
        <a href="${clientUrl}/login">Go to Login</a>
      </div>
    `);
  } catch (error) {
    res.status(500).json({
      message: "Could not verify the email.",
    });
  }
};

const resendVerificationEmail = async (
  req,
  res
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Please enter your email",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "Email is already verified",
      });
    }

    user.verificationToken =
      makeVerificationToken();

    user.verificationTokenExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    await user.save();

    const verificationEmailSent =
      await sendVerificationMessage(user);

    if (!verificationEmailSent) {
      return res.status(503).json({
        message:
          "Email credentials are not configured yet.",
      });
    }

    res.json({
      message:
        "A new verification email has been sent.",
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Could not resend the verification email.",
    });
  }
};

const getProfile = async (req, res) => {
  try {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      authProvider: req.user.authProvider,
      googleId: req.user.googleId,
      steamId: req.user.steamId,
      steamName: req.user.steamName,
      steamAvatar: req.user.steamAvatar,
      steamProfileUrl:
        req.user.steamProfileUrl,
      avatar: req.user.avatar,
      createdAt: req.user.createdAt,
      isVerified: req.user.isVerified,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    let emailChanged = false;

    if (
      req.body.email &&
      req.body.email.toLowerCase().trim() !==
        user.email
    ) {
      const newEmail = req.body.email
        .toLowerCase()
        .trim();

      const emailExists = await User.findOne({
        email: newEmail,
      });

      if (emailExists) {
        return res.status(400).json({
          message:
            "Email is already being used",
        });
      }

      user.email = newEmail;
      user.isVerified = false;
      user.verificationToken =
        makeVerificationToken();

      user.verificationTokenExpires =
        new Date(
          Date.now() + 24 * 60 * 60 * 1000
        );

      emailChanged = true;
    }

    user.name =
      req.body.name || user.name;

    if (req.body.steamId !== undefined) {
      user.steamId = String(
        req.body.steamId
      ).trim();
    }

    const updatedUser = await user.save();

    let verificationEmailSent = false;

    if (emailChanged) {
      verificationEmailSent =
        await sendVerificationMessage(
          updatedUser
        );
    }

    res.json({
      ...createUserResponse(updatedUser),
      verificationEmailSent,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        message:
          "Please complete every password field.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message:
          "New passwords do not match.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message:
          "New password must be at least 8 characters.",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message:
          "New password must be different from the current password.",
      });
    }

    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        message:
          "This account currently uses Google login.",
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        message:
          "Current password is incorrect.",
      });
    }

    user.password = await bcrypt.hash(
      newPassword,
      10
    );

    await user.save();

    res.json({
      message:
        "Password changed successfully.",
      token: makeToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Could not change password.",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  verifyEmail,
  resendVerificationEmail,
  getProfile,
  updateProfile,
  changePassword,
};
