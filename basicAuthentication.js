const bcrypt = require("bcryptjs");
const userModel = require("./models/userModels");

async function getUserFromAuthorization(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }
  const authInfo = authHeader.split(" ");
  if (authInfo.length !== 2 || authInfo[0] !== "Basic") {
    return null;
  }
  const decodedToken = Buffer.from(authInfo[1], "base64").toString("utf-8");
  const [username, password] = decodedToken.split(":");

  const user = await userModel.findOne({ username });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return null;
  }
  return user;
}

async function basicAuthentication(req, res, next) {
  const user = await getUserFromAuthorization(req);

  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.user = user;
  next();
}

module.exports = { basicAuthentication };
