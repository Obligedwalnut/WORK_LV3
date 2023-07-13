const jwt = require("jsonwebtoken");
const {Users} = require("../models");

// 사용자 인증 미들웨어
const verifyToken = async (req, res, next) => {
  const { Authorization } = req.cookies;
  // console.log(Authorization)
  const [authType, authToken] = (Authorization ?? "").split(" ");
  // console.log(authType)
  // console.log(authToken)
    if (!authToken || authType !== "Bearer") {
    res.status(401).send({
      errorMessage: "11111",
    });
    return;
  } 

  try {
    const { nickname } = jwt.verify(authToken, 'my-secret-key');
    const user = await Users.findOne({where:{nickname}});
    res.locals.user = user;
    
    next();
  } catch (err) {
    console.error(err);
    res.status(401).send({
      errorMessage: "22222.",
    });
  }
};

module.exports = verifyToken;