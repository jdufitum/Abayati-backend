const express = require('express')
const router = express.Router()

const {register,login,addToCart,addToWishlist,getUserById,removeFromWishlist,removeFromCart} = require("../controllers/userController")

router.get("/user/:id",getUserById)
router.post("/register",register)
router.post("/login",login)
router.post("/addToCart",addToCart)
router.post("/addToWishlist",addToWishlist)
router.delete("/removeFromCart",removeFromCart)
router.delete("/removeFromWishlist",removeFromWishlist)
module.exports = router