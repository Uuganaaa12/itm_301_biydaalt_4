const express = require("express");
const { createUser } = require("../../controllers/user/add-user");

const router = express.Router();

router.post("/users", createUser);
module.exports = router;
