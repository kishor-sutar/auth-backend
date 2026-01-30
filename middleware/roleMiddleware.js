const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        next();
    };
};

module.exports = authorize;


/*
Role-Based Authorization Middleware

Purpose:
- Restrict access based on user role
- Used after authentication middleware

Example:
- authorize(["admin"])
- authorize(["admin", "manager"])
*/
