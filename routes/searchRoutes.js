const express = require("express");
const { searchProducts } = require("../controllers/searchController");

const router = express.Router();

router.post("/search", searchProducts);

module.exports = router;
