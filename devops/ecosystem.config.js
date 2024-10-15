module.exports = {
  apps : [
      {
        name: "PocoServer",
        script: "dist/src/main.js",
        watch: false,
        max_restarts: 3,
        env: {
          "PORT": 80,
          "CONFIG_NAME": "Staging/PocoServer",
          "AWS_REGION": "us-east-1",
          "NODE_ENV": "production",
        },
      }
  ]
}