const { Schema, model } = require("mongoose");

const userStockSchema = new Schema({
    ticker: String,
    amount: Number,
});

const userSchema = new Schema({
    username: { type: String, unique: true },
    password: String,
    stocks: [userStockSchema],
});

module.exports = model("user", userSchema);