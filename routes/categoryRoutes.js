const express = require('express')
const router = express.Router()

const {createCategory,getAllCategories,getCategoryById,deleteCategory,updateCategory} = require("../controllers/categoryController")

router.get("/category/:id",getCategoryById)
router.post("/category/create",createCategory)
router.get("/categories",getAllCategories)
router.delete("/category/delete/:id",deleteCategory)
router.put("/category/update/:id",updateCategory)
module.exports = router