const { Schema, model } = require("mongoose");

const companySchema = new Schema({
    name: { type: String, unique: true },
    description: String,
    logoUrl: String,
});

module.exports = model("company", companySchema);