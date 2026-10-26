module.exports = {
    apps: [
        {
            name: "edge-api",
            script: "server.js",
            cwd: "/opt/realestate/server",
            instances: 1,
            exec_mode: "fork",
            autorestart: true,
            max_memory_restart: "350M",
            env: {
                NODE_ENV: "production",
            },
        },
    ],
};
