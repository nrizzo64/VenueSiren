const { Pool } = require("pg");

const tables = {
  spotify_users_table: "spotify_users",
  spotify_tokens_table: "spotify_tokens",
  sessions_table: "sessions",
};

const pool = new Pool({
  user: "",
  host: "localhost",
  database: "venue_siren_db",
  password: "",
  port: 5432,
});


async function saveUser(userData) {
  const { spotifyUserId, sessionId, tokenData } = userData;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    /* User Query */
    const userQuery = {
      text: `INSERT INTO "${tables.spotify_users_table}" ( "spotify_user_id") 
               VALUES ($1)
               RETURNING "user_id"`,
      // parameterized queries to prevent SQL injection
      values: [spotifyUserId],
    };
    const userResult = await client.query(userQuery);
    const userId = userResult.rows[0].user_id;

    /* Session Query */
    const sessionQuery = {
      text: `INSERT INTO "${tables.sessions_table}" ("session_id", "user_id") 
               VALUES ($1, $2)`,
      values: [sessionId, userId],
    };
    await client.query(sessionQuery);

    /* Token Query */
    const { access_token, refresh_token, access_token_expiry_date } = tokenData;

    const tokenQuery = {
      text: `INSERT INTO "${tables.spotify_tokens_table}"
        ("access_token", "refresh_token", "access_token_expiration", "user_id")
               VALUES ($1, $2, $3, $4)`,
      values: [access_token, refresh_token, access_token_expiry_date, userId],
    };
    await client.query(tokenQuery);

    // Commit transaction
    await client.query("COMMIT");
    console.log("Transaction completed successfully");
  } catch (error) {
    console.error("Transaction failed, rolled back:", error.message);
  } finally {
    // Release the client back to the pool
    client.release();
  }
}

async function fetchUser() {
  try {
    const result = await pool.query(`SELECT * FROM ${spotifyUsersTable}`);
    console.log(result.rows); // Logs the data retrieved from your table
    return result.rows;
  } catch (error) {
    console.error("Error executing query", error.stack);
    return [];
  }
}

module.exports = {
  saveUser,
  fetchUser,
};
