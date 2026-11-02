require("dotenv").config();
const mysql = require("mysql2/promise");

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  await conn.query(`
    CREATE TABLE IF NOT EXISTS property_floor_plans (
      id INT AUTO_INCREMENT PRIMARY KEY,
      property_id INT NOT NULL,
      image VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      KEY property_id (property_id),
      CONSTRAINT fk_pfpl_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
    )
  `);

  const [tables] = await conn.query("SHOW TABLES LIKE 'property_floor_plans'");
  console.log(tables.length ? "property_floor_plans: exists" : "property_floor_plans: MISSING");

  await conn.end();
})().catch((err) => {
  console.error("MIGRATION FAILED:", err.message);
  process.exit(1);
});
