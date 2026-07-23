module.exports = {
  apps: [
    {
      name: "achievement-hub-api",
      script: "server.js",
      cwd: "./api",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 5050,
      },
    },
  ],
};
