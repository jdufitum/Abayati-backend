const Category = require("../models/Category");
const {cloudinary} = require("../utils/cloudinary")

exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;
         const result = await cloudinary.uploader.upload(req.file.path)
            const imgUrl = result.secure_url

        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(409).json({ error: "Duplicate",message:"Category already exists" });
        }

        const newCategory = new Category({ name, imgUrl });
        await newCategory.save();

        res.status(201).json({ message: "Category created successfully", data: newCategory });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).send({message:"Success", data:categories});
    } catch (error) {
        res.status(500).json({ error:error.message });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({ error: "Not found",message:"Category not found" });
        }

        res.status(200).json({message: "Success", data:category});
    } catch (error) {
        res.status(500).json({ error:error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedCategory = await Category.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found",error:"Not found" });
        }

        res.status(200).json({ message: "Category updated successfully", data: updatedCategory });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCategory = await Category.findByIdAndDelete(id);

        if (!deletedCategory) {
            return res.status(404).json({ message: "Category not found",error:"Not found" });
        }

        res.status(200).json({ message: "Category deleted successfully",data:deletedCategory });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
