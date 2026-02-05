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
                url: "http://localhost:5000",
                description: "Production Server"
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
