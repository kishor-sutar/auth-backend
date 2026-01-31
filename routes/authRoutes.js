const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authorize = require("../middleware/roleMiddleware");
const protect = require("../middleware/authMiddleware");
const passport = require("passport");

const router = express.Router();

console.log("REGISTER ROUTE HIT");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Kishor
 *               email:
 *                 type: string
 *                 example: kishor@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User already exists
 */


router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // normalize email
        const normalizedEmail = email.toLowerCase();

        // check if user already exists
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // default role
        let role = "user";

        // super admin bootstrap
        if (
            normalizedEmail ===
            process.env.SUPER_ADMIN_EMAIL.toLowerCase()
        ) {
            role = "super-admin";
        }

        // create user
        const user = new User({
            name,
            email: normalizedEmail,
            password,

            role
        });

        await user.save();

        return res.status(201).json({
            message: "User registered successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error"
        });
    }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: kishor@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login successful. JWT tokens are set in httpOnly cookies.
 *       400:
 *         description: Invalid credentials
 */

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        //check if user exists 

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email and password (user is duplicate)"
            });

        }

        //compare password

        const isMatch = await require("bcryptjs").compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email and password"
            });
        }
        /*
        JWT Creation
        
        Payload:
        - user id
        - user role
        
        Why:
        - Token represents authenticated user
        - Used to access protected routes
        
        Important:
        - JWT is signed, not encrypted
        - Anyone can read payload
        - Secret prevents tampering
        */


        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        );

        const refreshToken = jwt.sign(
            {
                id: user._id
            },
            process.env.JWT_REFRESH_SECRET,
            {
                expiresIn: "7d"
            }
        );

        user.refreshToken = refreshToken;
        await user.save();


        res.cookie("token", token, {
            httpOnly: true,       // JS cannot access
            secure: false,        // true in production (HTTPS)
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Login successfully",

        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });

    }


});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user and clear authentication cookies
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */

router.post("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
        secure: false
    });

    return res.status(200).json({
        message: "Logged out successfully"
    });
});



/*
router.get("/profile", protect, (req, res) => {
    return res.status(200).json({
        message: "Protected route accessed",
        user: req.user
    });
});
*/

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get logged-in user profile
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *       401:
 *         description: Not authorized
 */

router.get("/profile", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password -refreshToken");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
});




router.get("/admin", protect, authorize(["admin"]), (req, res) => {
    return res.status(200).json({
        message: "Welcome admin"
    });
});


//  create promotion route (super -admin only)

router.put(
    "/promote/:userId",
    protect,
    authorize(["super-admin"]),
    async (req, res) => {
        try {
            const user = await User.findById(req.params.userId);

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            user.role = "admin";
            await user.save();

            return res.status(200).json({
                message: "User promoted to admin"
            });

        } catch (error) {
            return res.status(500).json({
                message: "Server error"
            });
        }
    }
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token cookie
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *       401:
 *         description: Refresh token invalid or expired
 */

router.post("/refresh", async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({
            message: "Refreshing token missing"
        });
    }

    try {
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );
        const user = await User.findById(decoded.id);
        // const newRefreshToken = jwt.sign(
        //     { id: user._id },
        //     process.env.JWT_REFRESH_SECRET,
        //     { expiresIn: "7d" }
        // );

        // user.refreshToken = newRefreshToken;
        // await user.save();


        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
                message: "Refresh token revoked"
            });
        }

        const newRefreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        user.refreshToken = newRefreshToken;
        await user.save();
        const newAccessToken = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        );

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });


        res.cookie("token", newAccessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 15 * 60 * 1000
        });

        return res.status(200).json({
            message: "access token refreshed"
        });


    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired refresh token"
        });
    }
});


/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Login with Google OAuth
 *     tags: [Auth]
 *     description: Redirects user to Google login page
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth
 */

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Auth]
 *     description: Handles Google login and issues JWT cookies
 *     responses:
 *       302:
 *         description: Redirect to frontend after successful login
 */

router.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: "/login"
    }),

    async(req, res) => {
        const user = await User.findById(req.user._id);

        const accessToken = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie("token", accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 15 * 60 * 1000
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // redirect to frontend
        res.redirect("http://localhost:5000/api/auth/profile");
    }

);



module.exports = router;



/*
Authentication Routes

Current Feature:
- User registration (signup)

Flow:
- Receive user data
- Validate email uniqueness
- Create user document
- Password hashing handled by model

Endpoint:
POST /api/auth/register
*/
