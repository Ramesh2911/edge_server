const db = require("../config/db");

const executeQuery = async (sql, params = []) => {
    const [results] = await db.query(sql, params);
    return results;
};

class LoanService {
    async create(data) {
        const result = await executeQuery(
            "INSERT INTO loan_applications (name, phone, email, amount) VALUES (?,?,?,?)",
            [data.name, data.phone, data.email || null, data.amount]
        );
        return result.insertId;
    }

    async getAll() {
        return await executeQuery("SELECT * FROM loan_applications ORDER BY created_at DESC");
    }
}

module.exports = new LoanService();
