import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// A pool keeps several connections open and reuses them,
// which is faster than connecting again for every request.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;