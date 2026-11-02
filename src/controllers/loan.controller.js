const loanService = require("../services/loan.service");
const response = require("../helpers/response");

class LoanController {
    async create(req, res) {
        try {
            const { name, phone, email, amount } = req.body || {};

            if (!name || !String(name).trim()) {
                return response.error(res, "Name is required", 400);
            }
            if (!phone || !String(phone).trim()) {
                return response.error(res, "Phone is required", 400);
            }
            if (email && !/^\S+@\S+\.\S+$/.test(String(email))) {
                return response.error(res, "Please provide a valid email", 400);
            }
            const amt = Number(amount);
            if (!Number.isFinite(amt) || amt <= 0) {
                return response.error(res, "Loan amount is required", 400);
            }

            const id = await loanService.create({
                name: String(name).trim(),
                phone: String(phone).trim(),
                email: email ? String(email).trim() : null,
                amount: amt,
            });
            return response.success(res, "Loan application submitted successfully", { id }, 201);
        } catch (err) {
            console.error("loan.create:", err);
            return response.error(res, "Could not submit loan application");
        }
    }

    async getAll(req, res) {
        try {
            const data = await loanService.getAll();
            return response.success(res, "Loan applications loaded", data);
        } catch (err) {
            return response.error(res, err.message, 500);
        }
    }
}

module.exports = new LoanController();
