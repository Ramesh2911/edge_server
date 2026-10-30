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
