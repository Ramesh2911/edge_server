require("dotenv").config();
const mysql = require("mysql2/promise");

// Idempotent schema migrations. Append new entries; never edit applied ones.
// Runs against the DB in the active .env (local dev or /opt/realestate/server/.env on VPS).
const MIGRATIONS = [
    {
        table: "property_verification",
        columns: [
            ["admin_a_reviewed_by", "INT DEFAULT NULL"],
            ["admin_a_reviewed_at", "TIMESTAMP NULL DEFAULT NULL"],
            ["admin_b_reviewed_by", "INT DEFAULT NULL"],
            ["admin_b_reviewed_at", "TIMESTAMP NULL DEFAULT NULL"],
            ["super_admin_reviewed_by", "INT DEFAULT NULL"],
            ["super_admin_reviewed_at", "TIMESTAMP NULL DEFAULT NULL"],
        ],
    },
    {
        table: "properties",
        columns: [
            ["view_count", "INT NOT NULL DEFAULT 0"],
        ],
    },
    {
        // Enquiry contact details captured on the form (points 8 & 15)
        table: "property_inquiries",
        columns: [
            ["name", "VARCHAR(255) DEFAULT NULL"],
            ["phone", "VARCHAR(20) DEFAULT NULL"],
            ["email", "VARCHAR(255) DEFAULT NULL"],
        ],
    },
];

// Full CREATE TABLE statements (idempotent)
const CREATE_STATEMENTS = [
    `CREATE TABLE IF NOT EXISTS property_floor_plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        property_id INT NOT NULL,
        image VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY property_id (property_id),
        CONSTRAINT fk_pfpl_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
    )`,
    // Newsletter subscribers (point 17)
    `CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        source VARCHAR(50) DEFAULT 'website',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_newsletter_email (email)
    )`,
    // Dynamic partner/developer logos on home (point 21)
    `CREATE TABLE IF NOT EXISTS partner_developers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        logo VARCHAR(500) DEFAULT NULL,
        website VARCHAR(500) DEFAULT NULL,
        description VARCHAR(500) DEFAULT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        is_active TINYINT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    // Dynamic home hero banners (point 1)
    `CREATE TABLE IF NOT EXISTS banners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        image VARCHAR(500) NOT NULL,
        title VARCHAR(255) DEFAULT NULL,
        subtitle VARCHAR(500) DEFAULT NULL,
        link VARCHAR(500) DEFAULT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        is_active TINYINT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
];

async function main() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: false,
    });

    let applied = 0;
    let skipped = 0;

    try {
        for (const sql of CREATE_STATEMENTS) {
            await conn.query(sql);
            console.log("ensure table ok");
        }

        for (const migration of MIGRATIONS) {
            const [tables] = await conn.query(
                "SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?",
                [migration.table]
            );
            if (tables.length === 0) {
                console.log(`skip table ${migration.table} (does not exist yet)`);
                skipped += migration.columns.length;
                continue;
            }

            const [rows] = await conn.query(
                "SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ?",
                [migration.table]
            );
            const existing = new Set(rows.map((r) => r.COLUMN_NAME));

            for (const [name, definition] of migration.columns) {
                if (existing.has(name)) {
                    console.log(`skip ${migration.table}.${name} (exists)`);
                    skipped += 1;
                    continue;
                }
                await conn.query(
                    `ALTER TABLE \`${migration.table}\` ADD COLUMN \`${name}\` ${definition}`
                );
                console.log(`applied ${migration.table}.${name}`);
                applied += 1;
            }
        }
    } finally {
        await conn.end();
    }

    console.log(`Migration finished: ${applied} applied, ${skipped} skipped`);
}

main().catch((err) => {
    console.error("MIGRATION FAILED:", err.message);
    process.exit(1);
});
