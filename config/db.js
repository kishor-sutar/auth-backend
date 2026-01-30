const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed");
        console.error(error.message);
        process.exit(1);
    }
};

module.exports = connectDB;




/*
Database Connection Layer

Purpose:
- Central place for MongoDB connection logic
- Keeps database code separate from server logic
- Allows reuse across entire application

Important:
- Application should crash if DB connection fails
- Backend without database is useless for auth system
*/

