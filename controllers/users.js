const User = require("../models/user");
const Stock = require("../models/stock");
const axios = require("axios");

const getUser = async (req, res) => {
    const foundUser = await User.findById(req.params.id);

    if (!foundUser) return res.status(404).json({ message: "User not found" });

    const tickers = foundUser.stocks.map(stock => stock.ticker);

    const foundStocks = await Stock.find({ ticker: { $in: tickers }});

    // create an object to quickly reference a stock's price
    const priceMap = foundStocks.reduce((acc, stock) => ({ ...acc, [stock.ticker]: stock.price }), {});

    const stocks = foundUser.stocks.map(stock => ({
        ticker: stock.ticker,
        price: priceMap[stock.ticker],
        amount: stock.amount,
    }));

    return res.json({ user: { username: foundUser.username, stocks }});
};

const updateUserStocks = async (req, res, next) => {
    const ticker = req.body.ticker;
    const amount = parseInt(req.body.amount);

    if (!ticker || !amount) res.status(400).json({ message: "missing ticker or amount" });

    const stock = await createOrUpdateStock(ticker);

    // check if user already has the stock in their list
    const foundUser = await User.findById(req.params.id);

    if (!foundUser) return res.status(404).json({ message: "user not found" });

    const foundUserStock = foundUser.stocks.find(stock => stock.ticker === ticker);

    // calculate how many stocks the user would have in total
    const newAmount = (foundUserStock?.amount || 0) + amount;

    if (newAmount < 0) return res.status(400).json({ message: "invalid amount, user may not have negative stocks" });

    if (!foundUserStock) {
        // the user doesn't already have the stock in their list. add stock to user list
        await User.findByIdAndUpdate(req.params.id, { $push: { stocks: { ticker, amount }}});
    }
    else if (newAmount === 0) {
        // the user already has the stock in their list and the new amount is 0, remove the stock from the user's list
        await User.findByIdAndUpdate(req.params.id, { $pull: { stocks: { ticker }}});
    }
    else {
        // the user already has the stock in their list, update the stock's amount
        foundUserStock.amount = newAmount;

        const stocks = foundUser.stocks.map(stock => ({ ticker: stock.ticker, amount: stock.amount }));
        
        await User.findByIdAndUpdate(req.params.id, { $set: { stocks }});
    }

    next();
    // return res.json({ ticker, amount: newAmount, price: stock.price });
};

const createOrUpdateStock = async (ticker) => {
    const foundStock = await Stock.findOne({ ticker });

    const price = foundStock?.price || await fetchStockPrice(ticker);

    return foundStock
        ? Stock.findOneAndUpdate({ ticker }, { price, lastUpdated: new Date() })
        : Stock.create({ ticker, price, lastUpdated: new Date() });
};

const fetchStockPrice = async (ticker) => {
    const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${ticker}&interval=5min&month=2023-10&outputsize=full&apikey=${process.env.ALPHA_VANTAGE_KEY}`;
    const response = await axios.get(apiUrl);
    return Object.values(Object.values(response.data)[1])[0]["1. open"];
};

module.exports = {
    getUser,
    updateUserStocks,
};