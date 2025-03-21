const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  imgUrl: {
    type: String,
    required: true,
  },
  embedding: { 
    type: [Number], 
    default: [] 
  },
  sizeVariations: { 
    type: [String], 
    enum: ["XS", "S", "M", "L", "XL", "Custom"], 
    default: [] 
  },
  customMeasurements: {
    length: Number,
    width: Number,
    otherDetails: String,
  },
  materialDetails: {
    type: [String],
    default: [],
  },
  sleeveAndDesign: {
    sleeveType: String,
    embroidery: Boolean,
    embellishments: String,
  },
  colorVariations: {
    type: [String],
    default: [],
  },
  culturalFeatures: {
    styleType: {
      type: String,
      enum: ["Traditional", "Modern"],
    },
    regionSpecificDesign: String,
    eventCategory: {
      type: String,
      enum: ["Casual", "Formal", "Wedding", "Ramadan"],
    },
  },
  ratingAndReviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, min: 1, max: 5 },
      review: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
