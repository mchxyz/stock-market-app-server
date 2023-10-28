const express = require("express");
require("dotenv").config();
require("./config/db");

var cors = require('cors')

const app = express();

const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "http://localhost:3000");
//     res.header("Access-Control-Allow-Headers", "content-type,authorization");
//     res.header("Access-Control-Allow-Headers", "content-type,authorization");
//     next();
// });

app.use("/auth", require("./routes/auth"));
app.use("/users", require("./routes/users"));

app.listen(PORT, () => {
    console.log("server listening from port " + PORT);
});