const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Product = require("../models/Product");

exports.register = async (req, res) => {
  try {
    const user = req.body;
    const duplicateEmail = await User.findOne({ email: user.email });
    if (duplicateEmail) {
      return res.send("Email already exist!");
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    const newUser = await new User(user).save();
    return res.status(200).send({message: "Success", data:newUser});
  } catch (err) {
    return res.status(500).send(err);
  }
};

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).send({message: "Invalid email or password!"});
    }

    const isPasswordValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(404).send({message: "Invalid email or password!"});
    }
    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.SECRET_KEY
    );

    return res.status(200).send({data: {token, data:user} });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// exports.getUserById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const user = await User.findById(id);

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     res.status(200).send(user);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ error: "Internal server error", details: error.message });
//   }
// };

exports.getUserByToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    console.log(req.headers.authorization)
    if (!token) {
      return res.status(401).json({message:"Access denied. No token provided."});
    }
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(404).json({message:"User not found."});
    } 

    return res.status(200).json({
      message: "User retrived successfully",
      data: user,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.addToCart = async (req, res) => {
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
    res.status(200).send({message:"Added to Cart!", data:cartItem});
  } catch (err) {
    res.status(500).send({message: err.message});
  }
};
exports.removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ error: "Invalid data provided" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const cartItemIndex = user.cart.findIndex((item) => item.productId.equals(productId));

    if (cartItemIndex === -1) {
      return res.status(400).json({ error: "Product not in cart" });
    }
    user.cart.splice(cartItemIndex, 1);
    await user.save();

    return res.status(200).json({
      message: "Product removed from cart",
      data: user.cart,
    });
  } catch (error) {
    return res.status(500).send({message: error.message});
  }
};

exports.addToWishlist = async (req, res) => {
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
      return res
        .status(200)
        .json({
          message: "Product added to wishlist",
          data: user.wishlist,
        });
    }

    return res.status(200).send({message: "Product is already in wishlist"});
  } catch (error) {
    return res.status(500).send({message: error.message});
  }
};
exports.removeFromWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) {
      return res.status(400).json({ error: "Invalid data provided" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.wishlist.includes(productId)) {
      return res.status(400).json({ error: "Product not in wishlist" });
    }

    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    await user.save();

    return res.status(200).json({
      message: "Product removed from wishlist",
      data: user.wishlist,
    });
  } catch (error) {
    return res.status(500).send({message: error.message});
  }
};
