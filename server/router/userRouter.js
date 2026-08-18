const express = require("express");
const userService = require("../service/userService")

const userRouter = express.Router();

userRouter.route('/start')
    .get(userService.getStartServer)

userRouter.route('/menu')
    .get(userService.getMenus)

userRouter.route('/table')
    .get(userService.getTables)

userRouter.route('/order')
    .post(userService.createOrders)

userRouter.route('/session')
    .post(userService.createSessions)
    .put(userService.closedSession)

userRouter.route('/session/:session_id/orders')
    .get(userService.getOrdersBySessionId)

userRouter.route('/session/:session_id/customer-count')
    .get(userService.getCustomerCountBySessionId)

module.exports = userRouter;