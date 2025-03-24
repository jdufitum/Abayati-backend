const express = require("express")
const router = express.Router()
const {createOrder,createPayment} = require("../controllers/paymentController")

router.post("/orders",createOrder)
router.post("/payments",createPayment)

module.exports = router