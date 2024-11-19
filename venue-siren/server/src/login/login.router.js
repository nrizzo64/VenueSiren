/**
 * Defines the router for logging into Venue Siren.
 *
 * @type {Login}
 */

const router = require("express").Router();
const controller = require("./login.controller.js");

router.route("").post(controller.login);

module.exports = router;
