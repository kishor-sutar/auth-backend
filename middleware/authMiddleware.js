const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    let token;
    token = req.cookies.token;
    // check Authorization header
    // if (
    //     req.headers.authorization &&
    //     req.headers.authorization.startsWith("Bearer")
    // ) {
    //     token = req.headers.authorization.split(" ")[1];
    // }

    if (!token) {
        return res.status(401).json({
            message: "Not authorized, token missing"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // attach user info to request
        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Not authorized, token invalid"
        });
    }
};

module.exports = protect;

