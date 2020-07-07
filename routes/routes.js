const express = require("express");
const router = express.Router();

const authusers = [];

router.post("/", (req, res) => {
  res.send({ response: true }).status(200);
  authusers.push(req.body);
  // console.log(authusers);
});

router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let auth = authusers.filter(
    (user) => user.email === email && user.password == password
  );
  // console.log(authusers, auth);
  if (auth.length > 0) {
    console.log("true logged in lets now chat", auth);
    res.send({ response: true }).status(200);
  }
  res.send({ response: " not valid user" }).status(200);
});

module.exports = router;
