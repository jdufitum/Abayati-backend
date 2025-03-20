const express = require('express')
const router = express.Router()

const {register,login,addToCart,addToWishlist,getUserById} = require("../controllers/userController")

router.get("/user/:id",getUserById)
router.post("/register",register)
router.post("/login",login)
router.post("/addToCart",addToCart)
router.post("/addToWishlist",addToWishlist)
module.exports = router