const express = require('express')
const router = express.Router()

const {createProduct,getAllProducts,getProductById,deleteProduct,updateProduct} = require("../controllers/productController")

router.get("/product/:id",getProductById)
router.post("/product/create",createProduct)
router.get("/products",getAllProducts)
router.delete("/product/delete/:id",deleteProduct)
router.put("/product/update/:id",updateProduct)
module.exports = router