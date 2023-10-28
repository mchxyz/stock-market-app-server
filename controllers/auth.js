const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signup = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Provide username and password." });
    }

    User.findOne({ username })
        .then((user) => {
            if (user) {
                return res.status(400).json({ message: "The username is already taken." });
            }

            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);

            User.create({ username, password: hashedPassword })
                .then((user) => {
                    const payload = { username: user.username, id: user._id.toString() };

                    const authToken = jwt.sign(payload, process.env.JWT_SECRET, {
                        algorithm: "HS256",
                        expiresIn: "6h",
                    });

                    return res.json({ authToken });
                })
                .catch((err) => {
                    return res.status(500).json({ message: "Internal server error" });
                });
        })
        .catch((err) => {
            return res.status(500).json({ message: "Internal server error" });
        });
};

const login = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Provide username and password." });
    }

    User.findOne({ username })
        .then((user) => {
            if (!user) {
                return res.status(400).json({ message: "Incorrect username or password." });
            }

            const passwordCorrect = bcrypt.compareSync(password, user.password);

            if (!passwordCorrect) {
                return res.status(400).json({ message: "Incorrect username or password." });
            }

            const payload = { username: user.username, id: user._id.toString() };

            const authToken = jwt.sign(payload, process.env.JWT_SECRET, {
                algorithm: "HS256",
                expiresIn: "6h",
            });

            return res.json({ authToken });
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({ message: "Internal server error." });
        });
};

const authenticate = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(400).json({ message: "missing token" });
    }

    const token = req.headers.authorization.split(" ")[1];

    try {
        const tokenInfo = jwt.verify(token, process.env.JWT_SECRET);
        req.user = tokenInfo;
        next();
    }
    catch(error) {
        return res.status(401).json({ message: "unauthorized" });
    }
};

module.exports = {
    signup,
    login,
    authenticate,
};