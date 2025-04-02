const { verifyToken } = require("../utils/jwtHelper");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const { valid, expired, decoded } = verifyToken(token);

      if (!valid) {
        return res.status(401).json({
          success: false,
          message: expired ? "Token has expired" : "Invalid token",
        });
      }

      req.userId = decoded.id;
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }
};

module.exports = { protect };
