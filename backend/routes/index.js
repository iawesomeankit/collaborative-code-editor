const express = require('express');
const routes = express.Router();
const code = require("./roomCode");

routes.use('/code', code.router);

module.exports = routes;
