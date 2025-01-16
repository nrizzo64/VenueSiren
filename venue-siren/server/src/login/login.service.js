// probably an unneeded file

const { Pool } = require("pg");

const usersTable =  'users';

const pool = new Pool({
  user: "",
  host: "localhost",
  database: "venue_siren_db",
  password: "",
  port: 5432,
});

async function checkForSessionId(sessionId) {

}

async function saveUser(spotifyUsername, sessionId, sessionsIdTimeStamp, accessToken, refreshToken) {
    
}

module.exports = {
    checkForSessionId,
};
