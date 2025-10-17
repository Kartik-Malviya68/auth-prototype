module.exports = {
  apps: [
    {
      name: "auth-server",
      script: "api/index.js",
      cwd: "/home/ubuntu/auth-prototype",
      node_args: "--enable-source-maps",
      env: {
        NODE_ENV: "production",
        PORT: "4114",
        RUN_LOCAL: "1"
      }
    }
  ]
};
