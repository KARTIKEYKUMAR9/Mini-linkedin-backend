const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ msg: 'No token' });

  const token = authHeader.startsWith("Bearer ")?authHeader.split(" ")[1] : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch(err) {
    if(err.name === "TokenExpiredError"){
      return res.status(401).json({msg: "Token expired"});
    }
    res.status(401).json({ msg: 'Invalid token' });
  }
};
