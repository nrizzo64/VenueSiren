const { Pool } = require("pg");

const usersTable =  'users';

const pool = new Pool({
  user: "",
  host: "localhost",
  database: "venue_siren_db",
  password: "",
  port: 5432,
});

async function saveUser(spotifyUsername, sessionId, sessionsIdTimeStamp, accessToken, refreshToken) {
    
}

async function fetchUser() {
  try {
    const result = await pool.query(`SELECT * FROM ${usersTable}`);
    console.log(result.rows); // Logs the data retrieved from your table
    return result.rows
  } catch (error) {
    console.error("Error executing query", error.stack);
    return []
  } finally {
    await pool.end(); // Close the pool connection after query
  }
}

module.exports = {
    saveUser,
    fetchUser,
};
