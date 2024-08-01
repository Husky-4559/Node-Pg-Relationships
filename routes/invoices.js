const express = require("express");
const router = new express.Router();
const client = require("../db");

// GET /invoices
router.get("/", async (req, res, next) => {
	try {
		const result = await client.query("SELECT id, comp_code FROM invoices");
		return res.json({ invoices: result.rows });
	} catch (err) {
		return next(err);
	}
});

// GET /invoices/[id]
router.get("/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		const result = await client.query(
			"SELECT id, amt, paid, add_date, paid_date, companies.code, companies.name, companies.description " +
				"FROM invoices JOIN companies ON invoices.comp_code = companies.code WHERE id = $1",
			[id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Invoice not found" });
		}

		const data = result.rows[0];
		const invoice = {
			id: data.id,
			amt: data.amt,
			paid: data.paid,
			add_date: data.add_date,
			paid_date: data.paid_date,
			company: {
				code: data.code,
				name: data.name,
				description: data.description,
			},
		};

		return res.json({ invoice });
	} catch (err) {
		return next(err);
	}
});

// POST /invoices
router.post("/", async (req, res, next) => {
	try {
		const { comp_code, amt } = req.body;
		const result = await client.query(
			"INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date",
			[comp_code, amt]
		);

		return res.json({ invoice: result.rows[0] });
	} catch (err) {
		return next(err);
	}
});

// PUT /invoices/[id]
router.put("/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		const { amt } = req.body;
		const result = await client.query(
			"UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING id, comp_code, amt, paid, add_date, paid_date",
			[amt, id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Invoice not found" });
		}

		return res.json({ invoice: result.rows[0] });
	} catch (err) {
		return next(err);
	}
});

// DELETE /invoices/[id]
router.delete("/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		const result = await client.query(
			"DELETE FROM invoices WHERE id=$1 RETURNING id",
			[id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Invoice not found" });
		}

		return res.json({ status: "deleted" });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
