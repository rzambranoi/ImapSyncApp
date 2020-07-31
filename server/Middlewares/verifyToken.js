const jwt = require("jsonwebtoken");

function verifiyToken(req, res, next) {
  const authHeader = req.get("authorization");
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    console.log(token);
    if (token) {
      jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) {
          res.status(402).json({
            error: "No Authenticated",
          });
        } else {
          req.user = user;
          next();
        }
      });
    } else {
      res.status(402).json({
        error: "No Authenticated",
      });
    }
  } else {
    res.status(402).json({
      error: "No Authenticated",
    });
  }
}

module.exports = verifiyToken;
