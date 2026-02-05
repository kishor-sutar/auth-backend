require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("./config/passport");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");



const app = express();
connectDB();
app.use(cors({
    origin: process.env.NODE_ENV === "production" 
        ? "https://your-frontend-domain.com" // Update this later for your frontend
        : "http://localhost:5173",
    credentials: true
}));

app.use(cookieParser());
app.use(passport.initialize());

app.use(express.json());



app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("server is running from AUTH-BACKEND");
});



const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
    customCssUrl: CSS_URL,
}));

app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}/`);
});



// At the very end of your index.js
module.exports = app;
