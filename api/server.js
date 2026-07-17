require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDatabase = require(
  "./config/database"
);

const authRoutes = require(
  "./routes/authRoutes"
);

const contactRoutes = require(
  "./routes/contactRoutes"
);

const leaderboardRoutes = require(
  "./routes/leaderboardRoutes"
);

const steamRoutes = require(
  "./routes/steamRoutes"
);

const achievementRoutes = require(
  "./routes/achievementRoutes"
);

const app = express();

connectDatabase();

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173",

    credentials: true
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message:
      "Achievement Hub API is running."
  });
});

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/contact",
  contactRoutes
);

app.use(
  "/api/leaderboard",
  leaderboardRoutes
);

app.use(
  "/api/steam",
  steamRoutes
);

app.use(
  "/api/achievements",
  achievementRoutes
);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found."
  });
});

app.use(
  (error, req, res, next) => {
    console.error(
      "Server error:",
      error.message
    );

    res.status(500).json({
      message:
        "Something went wrong on the server."
    });
  }
);

const PORT =
  process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(
    `API running on port ${PORT}`
  );
});
