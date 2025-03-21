const Product = require("../models/Product");
const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const getQueryEmbedding = async (query) => {
    try {
        const response = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: query,
        });

        return response.data[0].embedding;
    } catch (error) {
        console.error("Error generating query embedding:", error);
        return null;
    }
};

exports.searchProducts = async (req, res) => {
    try {
        const { query } = req.body;

        const queryEmbedding = await getQueryEmbedding(query);
        if (!queryEmbedding) {
            return res.status(500).json({ error: "Failed to generate query embedding" });
        }

        const products = await Product.find();
        
        const similarity = (vec1, vec2) => {
            const dotProduct = vec1.reduce((acc, val, i) => acc + val * vec2[i], 0);
            const magnitude1 = Math.sqrt(vec1.reduce((acc, val) => acc + val ** 2, 0));
            const magnitude2 = Math.sqrt(vec2.reduce((acc, val) => acc + val ** 2, 0));
            return dotProduct / (magnitude1 * magnitude2);
        };

        const rankedProducts = products
            .map(product => ({
                ...product.toObject(),
                score: similarity(queryEmbedding, product.embedding)
            }))
            .sort((a, b) => b.score - a.score) // Sort by highest similarity

            .slice(0, 10); // Return top 10 results

        res.status(200).json(rankedProducts);
    } catch (error) {
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
};
