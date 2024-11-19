/**
 * Defines a helper function that validates the session for each request
 */
const { login } = require("../login/login.controller")
const { Pool } = require("pg");

const sessionsTable = "sessions";

const pool = new Pool({
  user: "",
  host: "localhost",
  database: "venue_siren_db",
  password: "",
  port: 5432,
});

async function fetchSession(sessionId) {
  try {
    const result = await pool.query(
      `SELECT * FROM ${sessionsTable} WHERE session_id = $1`,
      [sessionId]
    );
    console.log(result.rows); // Logs the data retrieved from your table
    return result.rows;
  } catch (error) {
    console.error("Error executing query", error.stack);
    return [];
  }
}

// export
async function validateSession(req, res, next) {
  if (req.path === '/spotify-redirect') {
    console.log("skipping cookie parsing")
    next();
  }

  // Parse cookies
  const cookies = req.headers.cookie;
  if (!cookies) {
    return login(req, res, next)
  }
  const cookieObj = Object.fromEntries(
    cookies.split("; ").map((cookie) => cookie.split("="))
  );
  
  // Parse sessionId
  const sessionId = cookieObj.sessionId;
  if (!sessionId) {
    return login[0](req, res, next)
  }
  
  try {
    const session = await fetchSession(sessionId);
    if (session.length === 0) {
      return login(req, res, next)
    }

    next();

  } catch (error) {
    console.error("Session validation error:", error);
    next(error); // Pass the error to Express’s error handler
  }
}

module.exports = validateSession;
