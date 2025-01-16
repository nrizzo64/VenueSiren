/**
 * Defines a helper function that validates the session for each request
 */
const { Pool } = require("pg");

const sessionsTable = "sessions";

const pool = new Pool({
  user: "",
  host: "localhost",
  database: "venue_siren_db",
  password: "",
  port: 5432,
});

const loginPath = `/login`;

async function getSession(sessionId) {
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
  /* redirect to login middleware to refresh session if session cookie is missing, malformed, or expired */
  if (req.path === "/spotify-redirect" || req.path === "/login") {
    console.log(`\tskipping cookie parsing`);
    // client path - skipping cookie parsing because the user is in the middle of the auth flow and the session cookie has yet to be set by the server

    return next();
  }

  // Parse cookies
  const sessionId = req.cookies.sessionId;

  if (!sessionId) {
    console.log("no sessionId: redirecting user to login");
    return res.redirect(loginPath);
  }

  try {
    const session = await getSession(sessionId);
    if (session.length === 0) {
      console.log("no session in db: redirecting user to login");
      return res.redirect(loginPath);
    }

    next();
  } catch (error) {
    console.error("Session validation error:", error);
    res.status(500).send();
  }
}

module.exports = validateSession;
