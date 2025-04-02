const express = require('express')
const router = express.Router()

const {getAllStores,createStore,getProductsInStore,getStoreById,getStoresByCategory,deleteStore,updateStore} = require("../controllers/storeController")

// router.get("/user/:id",getUserById)
router.get("/stores",getAllStores)
router.get("/getProductsInStore/:storeId",getProductsInStore)
router.get("/getStoreById/:id",getStoreById)
router.get("/getStoresByCategory/:categoryId",getStoresByCategory)
router.post("/createStore",createStore)
router.put("/updateStore",updateStore)
router.delete("/deleteStore",deleteStore)
module.exports = router