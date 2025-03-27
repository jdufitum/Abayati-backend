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
      return res
        .status(500)
        .send({ message: "Failed to generate query embedding",error: "Internal server error" });
    }

    const products = await Product.find();

    if(products.length === 0){
        return res.status(204).send({message: "We couldn't find what you are looking for", error:"Not found"})
    }

    const similarity = (vec1, vec2) => {
      const dotProduct = vec1.reduce((acc, val, i) => acc + val * vec2[i], 0);
      const magnitude1 = Math.sqrt(
        vec1.reduce((acc, val) => acc + val ** 2, 0)
      );
      const magnitude2 = Math.sqrt(
        vec2.reduce((acc, val) => acc + val ** 2, 0)
      );
      return dotProduct / (magnitude1 * magnitude2);
    };
    const similarityThreshold = 0.8;
    const rankedProducts = products
      .map((product) => ({
        ...product.toObject(),
        score: similarity(queryEmbedding, product.embedding),
      }))
      .filter((product) => product.score >= similarityThreshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
      if(rankedProducts.length === 0){
        return res.status(404).send({message: `No matches for ${query}`, error:"Not found"})
    }

    return res.status(200).send({data: rankedProducts});
  } catch (error) {
    res
      .status(500)
      .send({ error: "Internal server error", message: error.message });
  }
};
