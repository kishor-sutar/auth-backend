const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["user", "admin", "super-admin"],
            default: "user"
        },

        refreshToken: {
            type: String
        }


    },
    {
        timestamps: true
    }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model("User", userSchema);




/*
User Schema

Purpose:
- Defines how user data is stored in MongoDB
- Acts as blueprint for authentication system

Fields:
- name: user display name
- email: unique identifier for login
- password: hashed password (never plain text)
- role: used for authorization (user / admin)

Notes:
- Email must be unique
- Password will be hashed later using bcrypt
- timestamps automatically add createdAt and updatedAt
*/
