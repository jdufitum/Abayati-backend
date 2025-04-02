const Store = require("../models/Store");
const {cloudinary} = require("../utils/cloudinary")

exports.createStore = async (req, res) => {
    try {
        const { name,categories,products,description } = req.body;
         const result = await cloudinary.uploader.upload(req.file.path)
            const imgUrl = result.secure_url

            if(!name || !categories || !description || !imgUrl){
                return res.status(400).send({message:"Input all required fields", error:"Bad request"})
            }

        const newStore = new Store({ name,categories,products,description, imgUrl });
        await newStore.save();

        return res.status(201).send({ message: "Store created successfully", data: newStore });

    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

exports.getAllStores = async (req, res) => {
    try {
        const Stores = await Store.find().populate(["categories","products"]);
        res.status(200).send({message:"Success", data:Stores});
    } catch (error) {
        res.status(500).send({ error:error.message });
    }
};

exports.getStoreById = async (req, res) => {
    try {
        const { id } = req.params;
        const store = await Store.findById(id).populate(["categories","products"]);

        if (!store) {
            return res.status(404).send({ error: "Not found",message:"Store not found",data:null });
        }

        res.status(200).send({message: "Success", data:store});
    } catch (error) {
        res.status(500).send({ error:error.message });
    }
};

exports.updateStore = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedStore = await Store.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedStore) {
            return res.status(404).send({ message: "Store not found",error:"Not found",data:null });
        }

        res.status(200).send({ message: "Store updated successfully", data: updatedStore });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.deleteStore = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedStore = await Store.findByIdAndDelete(id);

        if (!deletedStore) {
            return res.status(404).send({ message: "Store not found",error:"Not found",data:null });
        }

        res.status(200).send({ message: "Store deleted successfully",data:deletedStore });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.getStoresByCategory = async(req,res)=>{
        try {
          const categoryId = req.params.id;
    
          const stores = await Store.find({
            categories: categoryId,
          }).populate(["categories","products"]); 
      
          if (!stores || stores.length === 0) {
            return res.status(404).send({ message: "No stores found for this category", error:"Not found" });
          }
      
          res.status(200).send({message: "success", data:stores});
        } catch (error) {
          console.error(error);
          res.status(500).send({ message: "Server error" });
        }
}

exports.getProductsInStore = async(req,res)=>{
    try {
      const storeId = req.params.id;

      const products = await Store.findById(storeId).populate("products"); 
  
      if (!products || products.length === 0) {
        return res.status(404).send({ message: "No products found for this store",error:"Not found" });
      }
  
        return  res.status(200).send({data: products.products, message:`Products in ${products.name} retrived successfully`});
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: error.message });
    }
}
