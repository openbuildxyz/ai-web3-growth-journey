{
  "apps": [
    {
      "name": "evalis-gt",
      "script": "backend/server.js",
      "instances": "max",
      "exec_mode": "cluster",
      "watch": false,
      "env": {
        "NODE_ENV": "production",
        "PORT": 3000
      },
      "env_production": {
        "NODE_ENV": "production",
        "PORT": 3000
      },
      "log_date_format": "YYYY-MM-DD HH:mm:ss Z",
      "error_file": "./backend/logs/pm2-error.log",
      "out_file": "./backend/logs/pm2-out.log",
      "log_file": "./backend/logs/pm2-combined.log",
      "merge_logs": true,
      "max_memory_restart": "1G",
      "min_uptime": "10s",
      "max_restarts": 5,
      "restart_delay": 4000,
      "autorestart": true,
      "kill_timeout": 5000,
      "listen_timeout": 8000,
      "wait_ready": true,
      "health_check_grace_period": 3000,
      "health_check_url": "http://localhost:3000/api/health",
      "shutdown_with_message": true,
      "cron_restart": "0 2 * * *",
      "ignore_watch": [
        "node_modules",
        "logs",
        "uploads"
      ],
      "source_map_support": false,
      "instance_var": "INSTANCE_ID"
    }
  ],
  "deploy": {
    "production": {
      "user": "deploy",
      "host": ["your-server.com"],
      "ref": "origin/main",
      "repo": "git@github.com:anntmishra/Evalis-GT.git",
      "path": "/var/www/evalis-gt",
      "pre-deploy": "git pull",
      "post-deploy": "npm install --production && npm run build && pm2 reload ecosystem.config.js --env production",
      "pre-setup": "echo 'Setting up deployment environment'"
    }
  }
}
