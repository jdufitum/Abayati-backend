const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Product = require("../models/Product")

const register = async(req,res)=>{
   try{
    const user= req.body
    const duplicateEmail = await User.findOne({email:user.email})
    if(duplicateEmail){
        return res.send("Email already exist!")
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    const newUser = await new User(user).save()
    return res.status(200).send(newUser)
   }catch(err){
    return res.status(500).send(err)
   }
}

const login = async(req, res)=>{
    try{
        const user = User.findOne({email: req.email})
        if(!user){
            return res.status(404).send("Invalid email or password!")
        }
        const isPasswordValid = bcrypt.compareSync(req.body.password,user.password);
        if(!isPasswordValid){
            return res.status(404).send("Invalid email or password!")
        }
        const token = jwt.sign({
            _id: user._id,
            email: user.email,
            role: user.role
        },process.env.SECRET_KEY)

        return res.status(200).send({token,user})
    }catch(err){
        return res.status(500).send(err)
    }
}

const addToCart = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;
        if (!userId || !productId || quantity < 1) {
            return res.status(400).json({ error: "Invalid data provided" });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        const cartItem = user.cart.find((item) => item.productId.equals(productId));

        if (cartItem) {
            cartItem.quantity += quantity;
        } else {
            user.cart.push({ productId, quantity });
        }
        await user.save();
        res.status(200).send("Added to Cart!");

    } catch (err) {
        res.status(500).send(err);
    }
};

const addToWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.body;
        if (!userId || !productId) {
            return res.status(400).json({ error: "Invalid data provided" });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        if (!user.wishlist.includes(productId)) {
            user.wishlist.push(productId);
            await user.save();
            return res.status(200).json({ message: "Product added to wishlist", wishlist: user.wishlist });
        }

       return res.status(400).send("Product is already in wishlist")

    } catch (error) {
        return res.status(500).send(error);
    }
};
