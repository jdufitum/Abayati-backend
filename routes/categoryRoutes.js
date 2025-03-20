const express = require('express')
const router = express.Router()

const {createCategory,getAllCategories,getCategoryById,deleteCategory,updateCategory} = require("../controllers/categoryController")

router.get("/category/:id",getCategoryById)
router.post("/createCategory",createCategory)
router.get("/getAllCategories",getAllCategories)
router.delete("/deleteCategory/:id",deleteCategory)
router.put("/updateCategory/:id",updateCategory)
module.exports = router