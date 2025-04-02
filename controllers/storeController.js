const Store = require("../models/Store");
const {cloudinary} = require("../utils/cloudinary")

exports.createStore = async (req, res) => {
    try {
        const { name } = req.body;
         const result = await cloudinary.uploader.upload(req.file.path)
            const imgUrl = result.secure_url

        const existingStore = await Store.findOne({ name });
        if (existingStore) {
            return res.status(409).json({ error: "Duplicate",message:"Store already exists",data:null });
        }

        const newStore = new Store({ name, imgUrl });
        await newStore.save();

        res.status(201).json({ message: "Store created successfully", data: newStore });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllStores = async (req, res) => {
    try {
        const Stores = await Store.find();
        res.status(200).send({message:"Success", data:Stores});
    } catch (error) {
        res.status(500).json({ error:error.message });
    }
};

exports.getStoreById = async (req, res) => {
    try {
        const { id } = req.params;
        const Store = await Store.findById(id);

        if (!Store) {
            return res.status(404).json({ error: "Not found",message:"Store not found",data:null });
        }

        res.status(200).json({message: "Success", data:Store});
    } catch (error) {
        res.status(500).json({ error:error.message });
    }
};

exports.updateStore = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedStore = await Store.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedStore) {
            return res.status(404).json({ message: "Store not found",error:"Not found",data:null });
        }

        res.status(200).json({ message: "Store updated successfully", data: updatedStore });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteStore = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedStore = await Store.findByIdAndDelete(id);

        if (!deletedStore) {
            return res.status(404).json({ message: "Store not found",error:"Not found",data:null });
        }

        res.status(200).json({ message: "Store deleted successfully",data:deletedStore });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getStoresByCategory = async(req,res)=>{
        try {
          const categoryId = req.params.categoryId;
    
          const stores = await Store.find({
            categories: categoryId,
          }).populate("categories"); 
      
          if (!stores || stores.length === 0) {
            return res.status(404).json({ message: "No stores found for this category" });
          }
      
          res.status(200).json(stores);
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Server error" });
        }
}

exports.getProductsInStore = async(req,res)=>{
    try {
      const storeId = req.params.storeId;

      const products = await Store.findById(storeId).populate("products"); 
  
      if (!products || products.length === 0) {
        return res.status(404).json({ message: "No products found for this store" });
      }
  
        return  res.status(200).json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
}
