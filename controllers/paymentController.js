require("dotenv").config()
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const Order = require("../models/Order")
const Payment = require("../models/Payment")
const Product = require("../models/Product")
const User = require("../models/User")
const jwt = require("jsonwebtoken")


exports.createOrder = async (req, res) => {
    try {
       const token = req.headers.authorization?.split(' ')[1];
          if (!token) {
            return res.status(401).send({message:"Access denied. No token provided.",error:"Access denied",data:null});
          }
          const decoded = jwt.verify(token, process.env.SECRET_KEY);
          const userId = decoded._id; 
      if (!userId) {
        return res.status(400).send({ error: "Bad request", message:"Invalid data provided" });
      }
      const user = await User.findById(userId)
      const cart = user.cart 
      if(cart.length === 0){
        return res.status(200).send("Cart is empty!")
      } 
      let totalAmount = 0;
      const products = [];
  
      for (const item of cart) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(404).send({ error: "Product not found" });
        }
        products.push({ productId: product._id, quantity: item.quantity });
        totalAmount += product.price * item.quantity;
      }
  
      const newOrder = new Order({
        user: userId,
        products,
        totalAmount,
      });
  
      await newOrder.save();
      return res.status(201).send({ message: "Order created successfully", order: newOrder });
    } catch (err) {
      res.status(500).send(err.message);
    }
  };

  exports.createPayment = async (req, res) => {
    try {
        const {orderId, paymentMethodId } = req.body;
         const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
              return res.status(401).send({message:"Access denied. No token provided.",error:"Access denied",data:null});
            }
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            const userId = decoded._id; 
  
        if (!userId || !orderId || !paymentMethodId) {
            return res.status(400).send({ error: "Missing required fields" });
        }
  
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).send({ error: "Order not found" });
        }
  
        // Ensure order is not already paid
        if (order.status === "paid") {
            return res.status(400).send({ error: "Order already paid" });
        }
  
        const paymentIntent = await stripe.paymentIntents.create({
            amount: order.totalAmount * 100, // Convert to cents
            currency: "qar", // Ensure correct currency
            payment_method: paymentMethodId,
            confirm: true,
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: "never"
            }
        });
  
        const payment = new Payment({
            user: userId,
            order: orderId,
            amount: order.totalAmount,
            status: paymentIntent.status === "succeeded" ? "completed" : "pending",
            transactionId: paymentIntent.id,
            paymentMethod: paymentMethodId,
        });
  
        await payment.save();
  
        if (paymentIntent.status === "succeeded") {
            order.status = "paid";
            await order.save();

            await User.findByIdAndUpdate(userId, { $set: { cart: [] } });

            return res.status(200).send({ message: "Payment successful", data: {payment, order} });
        } else {
            return res.status(400).send({ error: "Payment failed", payment });
        }
  
    } catch (err) {
        console.error("Stripe Error:", err);
        return res.status(500).send({ error: "Payment processing failed", details: err.message });
    }
  }; 
  



  