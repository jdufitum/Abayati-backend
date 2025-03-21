const Product = require("../models/Product");
const OpenAI = require('openai')

const openai = new OpenAI({apikey: process.env.OPENAI_API_KEY})

const generateEmbedding = async (text)=>{
    try{
        const response = await openai.embeddings.create({
            model:"text-embedding-ada-002",
            input: text
        })
        return response.data[0].embedding;
    }catch(err){
        console.log("Error generating embedding ",err)
        return null
    }
}

exports.createProduct = async (req, res) => {
    try {
        const { name, description, category, price, imgUrl } = req.body;

        if (!name || !description || !category || !price || !imgUrl) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const embedding = await generateEmbedding(`${name} ${description}`);

        if (!embedding) {
            return res.status(500).json({ error: "Failed to generate embedding" });
        }

        const newProduct = new Product({ name, description, category, price, imgUrl,embedding });
        await newProduct.save();

        res.status(201).json({ message: "Product created successfully", product: newProduct });

    } catch (error) {
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate("category"); // Fetch category details
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id).populate("category");

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
    } catch (error) {
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
};
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
};

exports.getProductsByCategory = async (req,res)=>{
    
}