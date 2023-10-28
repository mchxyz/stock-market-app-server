const mongoose = require("mongoose");

const db = mongoose.connection;

db.on("connected", () => {
    console.log("connected to MongoDB @" + db.host);
});

module.exports = mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});