const { Schema, model } = require("mongoose");

const stockSchema = new Schema({
    ticker: String,
    lastUpdated: Date,
    price: Number,
});

module.exports = model("stock", stockSchema);