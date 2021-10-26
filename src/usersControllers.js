const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const bearerHeaders = req.headers["authorization"];
  if (bearerHeaders) {
    const bearer = bearerHeaders.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;

    jwt.verify(req.token, process.env.SECRET_KEY, (err, results) => {
      if (err) {
        res.sendStatus(401);
      } else {
        req.results = results;
        next();
      }
    });
  } else {
    res.sendStatus(401);
  }
}

module.exports = verifyToken;
