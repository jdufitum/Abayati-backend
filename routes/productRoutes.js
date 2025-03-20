const express = require('express')
const router = express.Router()

const {createProduct,getAllProducts,getProductById,deleteProduct,updateProduct} = require("../controllers/productController")

router.get("/product/:id",getProductById)
router.post("/createProduct",createProduct)
router.get("/getAllProducts",getAllProducts)
router.delete("/deleteProduct/:id",deleteProduct)
router.put("/updateProduct/:id",updateProduct)
module.exports = router