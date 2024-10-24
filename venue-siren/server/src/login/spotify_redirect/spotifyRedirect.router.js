/**
 * Defines the router for the redirect page after attempting to login to Spotify.
 *
 * @type {Router}
 */

const router = require("express").Router()
const controller = require("./spotifyRedirect.controller.js")

router.route("/")
    .get(controller.recieveRedirect)

module.exports = router;