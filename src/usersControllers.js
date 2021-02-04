function verifyToken(req, res, next) {
  const bearerHeaders = req.headers["authorization"];
  if (typeof bearerHeaders !== undefined) {
    const bearer = bearerHeaders.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  }
}

module.exports = verifyToken;
