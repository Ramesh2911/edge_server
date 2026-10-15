const db = require("../config/db");

const executeQuery = async (sql, params = []) => {
    const [results] = await db.query(sql, params);
    return results;
};

class SettingService {
    async getAll() {
        const rows = await executeQuery(
            "SELECT setting_key, setting_value FROM site_settings"
        );
        return rows.reduce((acc, r) => {
            acc[r.setting_key] = r.setting_value;
            return acc;
        }, {});
    }

    async upsertMany(entries) {
        for (const key of Object.keys(entries)) {
            await executeQuery(
                `INSERT INTO site_settings (setting_key, setting_value) VALUES (?,?)
                 ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
                [key, entries[key]]
            );
        }
        return await this.getAll();
    }
}

module.exports = new SettingService();
