const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Auth Backend API",
            version: "1.0.0",
            description: "JWT + Refresh Token + Google OAuth Authentication API"
        },
        servers: [
            {
                // This ensures "Try it out" works on your live site
                url: "https://auth-backend-phi-dun.vercel.app",
                description: "Production Server"
            },
            {
                url: "http://localhost:5000",
                description: "Local Development Server"
            }
        ],
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "token"
                }
            }
        },
        security: [
            {
                cookieAuth: []
            }
        ]
    },
    apis: ["./routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
