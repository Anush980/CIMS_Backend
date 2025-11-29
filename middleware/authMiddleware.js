const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Please login first" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; //this stores user id
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Invalid or expired token. Please login again" });

  }
};

module.exports = authMiddleware;
