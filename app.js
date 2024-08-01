/** BizTime express application. */

const express = require("express");
const app = express();
const companyRoutes = require("./routes/companies");
const invoiceRoutes = require("./routes/invoices");

app.use(express.json());
app.use("/companies", companyRoutes);
app.use("/invoices", invoiceRoutes);

app.use((err, req, res, next) => {
	res.status(err.status || 500);
	res.json({
		error: err.message,
	});
});

module.exports = app;
