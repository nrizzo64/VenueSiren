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
  const { userId, spotifyUserId, sessionId, tokenData } = userData;
  // TODO: check tokenData for individual tokens
  if (!spotifyUserId || !sessionId || !tokenData) {
    throw new Error('Missing required user data.');
  }  

  if(userId != null) return await updateUser(userData);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    /* User Query */
    const userQuery = {
      text: `INSERT INTO "${tables.spotify_users_table}" ( "spotify_user_id") 
               VALUES ($1)
               RETURNING "user_id"`,
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
    return { userId, message: 'User saved successfully' };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Transaction failed, rolled back:", error.message);
    throw new Error('User insertion failed');
  } finally {
    // Release the client back to the pool
    client.release();
  }
}

async function updateUser(userData) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    const { sessionId, userId } = userData; 
    /* Session Update Query */
    const sessionQuery = {
      text: `UPDATE ${tables.sessions_table}
            SET session_id = $1
            WHERE user_id = $2`,
      values: [sessionId, userId],
    };
    await client.query(sessionQuery);

    /* Token Update Query */
    const { tokenData } = userData;
    const { access_token, refresh_token, access_token_expiry_date } = tokenData;

    const tokenQuery = {
      text: `UPDATE ${tables.spotify_tokens_table}
            SET access_token = $1,
                refresh_token = $2, 
                access_token_expiration = $3
            WHERE user_id = $4`,
      values: [access_token, refresh_token, access_token_expiry_date, userId],
    };
    await client.query(tokenQuery);

    // Commit transaction
    await client.query("COMMIT");
    console.log("Transaction completed successfully");
    return { userId, message: 'User updated successfully' };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Transaction failed, rolled back:", error.message);
    throw new Error('User update failed');
  } finally {
    // Release the client back to the pool
    client.release();
  }
}

async function getUserId(spotifyUserId) {
  try {
    const query = `SELECT user_id FROM ${tables.spotify_users_table} WHERE spotify_user_id = $1`;
    const values = [spotifyUserId];
    const result = await pool.query(query, values);

    console.log(result.rows[0]); // Logs the data retrieved from your table
    return result.rows[0];
  } catch (error) {
    console.error("Error executing query", error.stack);
    return [];
  }
}

module.exports = {
  saveUser,
  updateUser,
  getUserId
};
