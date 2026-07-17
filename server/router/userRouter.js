const express = require("express");
const userService = require("../service/userService")

const userRouter = express.Router();

userRouter.route('/start')
    .get(userService.getStartServer)

userRouter.route('/menu')
    .get(userService.getMenus)

module.exports = userRouter;