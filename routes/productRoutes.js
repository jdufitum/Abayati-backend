const express = require('express')
const router = express.Router()
const {createProduct,getAllProducts,getProductById,deleteProduct,updateProduct} = require("../controllers/productController")
const {upload} = require("../utils/multer")
router.get("/product/:id",getProductById)
router.post("/product/create",upload.single("imgUrl"),createProduct)
router.get("/products",getAllProducts)
router.delete("/product/delete/:id",deleteProduct)
router.put("/product/update/:id",upload.single("imgUrl"),updateProduct)
module.exports = router