const Product = require("../models/Product");
const Category = require("../models/Category");
const OpenAI = require("openai");
const {cloudinary} = require("../utils/cloudinary")

const openai = new OpenAI({ apikey: process.env.OPENAI_API_KEY });

const generateEmbedding = async (text) => {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });
    return response.data[0].embedding;
  } catch (err) {
    console.log("Error generating embedding ", err);
    return null;
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, category, price, sizeVariations,customMeasurements,materialDetails,sleeveAndDesign, culturalFeatures,regionSpecificDesign,ratingAndReviews} = req.body;

    const result = await cloudinary.uploader.upload(req.file.path)
    const imgUrl = result.secure_url
    if (!name || !description || !category || !price || !imgUrl) {
      return res.status(400).json({ message: "Fill all required fields",error:"Bad request" });
    }

    const categ = await Category.findById(category);
    if (!categ) {
      return res.status(404).send({message: "Category not found!",error:"Not found"});
    }



    // const embedding = await generateEmbedding(`${name} ${description}`);

    // if (!embedding) {
    //   return res.status(500).json({ error: "Failed to generate embedding" });
    // }

    const newProduct = new Product({
      name,
      description,
      category,
      price,
      imgUrl,
      sizeVariations,customMeasurements,materialDetails,sleeveAndDesign, culturalFeatures,regionSpecificDesign,ratingAndReviews
    });
    await newProduct.save();

    res
      .status(201)
      .json({ message: "Product created successfully", data: newProduct });
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category"); // Fetch category details
    res.status(200).json({message: "Retrived successfully" ,data:products});
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate("category");

    if (!product) {
      return res.status(404).json({ message: "Product not found",error:"Not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, ...otherUpdates } = req.body;
    const result = await cloudinary.uploader.upload(req.file.path)
    const imgUrl = result.secure_url
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found",error:"Not found" });
    }

    let updateFields = { ...otherUpdates };

    if (name !== undefined || description !== undefined) {
      const newName = name !== undefined ? name : product.name;
      const newDescription =
        description !== undefined ? description : product.description;

      if (newName !== product.name || newDescription !== product.description) {
        const embedding = await generateEmbedding(
          `${newName} ${newDescription}`
        );
        if (!embedding) {
          return res
            .status(500)
            .json({ message: "Failed to generate embedding",error:"Internal server error" });
        }
        updateFields.embedding = embedding;
      }

      updateFields.name = newName;
      updateFields.description = newDescription;
      updateFields.imgUrl = imgUrl
    }
    const updatedProduct = await Product.findByIdAndUpdate(id, updateFields, {
      new: true,
    });
    res.status(200).send({message: "Product updated successfully!",data:updatedProduct});
  } catch (error) {
    res.status(500).send({error: error.message});
  }
};
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found",error:"Not found" });
    }

    res.status(200).json({ message: "Product deleted successfully",data:deletedProduct });
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const categoryId = req.params;
    const products = await Product.find({ category: categoryId }).populate(
      "category"
    );
    return res.status(200).send({message: "Success", data: products});
  } catch (err) {
    return res.status(500).send({error: err.message});
  }
};
