module.exports = {
  apps: [{
    name: "scoutns-dev",
    script: "./server.mjs",
    env: {
      NODE_ENV: "production",
      PORT: 4174
    }
  }]
};
