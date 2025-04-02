const { generateToken } = require("../utils/jwtHelper");

const ADMIN_EMAIL = "admin@codesfortomorrow.com";
const ADMIN_PASSWORD = "Admin123!@#";
const ADMIN_ID = 1;

// Login controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    if (email !== ADMIN_EMAIL) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(ADMIN_ID);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { login };
