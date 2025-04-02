const express = require('express')
const router = express.Router()

const {getAllStores,createStore,getProductsInStore,getStoreById,getStoresByCategory,deleteStore,updateStore} = require("../controllers/storeController")
const {upload} = require("../utils/multer")

router.get("/stores",getAllStores)
router.get("/getProductsInStore/:id",getProductsInStore)
router.get("/getStoreById/:id",getStoreById)
router.get("/getStoresByCategory/:id",getStoresByCategory)
router.post("/createStore",upload.single("imgUrl"),createStore)
router.put("/updateStore/:id",updateStore)
router.delete("/deleteStore/:id",deleteStore)
module.exports = router