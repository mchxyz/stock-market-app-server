const router = require("express").Router();

const usersController = require("../controllers/users");
const authController = require("../controllers/auth");

// fetch user profile
router.get("/:id", authController.authenticate, usersController.getUser);

// add a stock to a user's page
router.put("/:id/stocks", authController.authenticate, usersController.updateUserStocks, usersController.getUser); 

module.exports = router;