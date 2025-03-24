require("dotenv").config()
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const Order = require("../models/Order")
const Payment = require("../models/Payment")
const Product = require("../models/Product")
const User = require("../models/User")


exports.createOrder = async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "Invalid data provided" });
      }
      const user = await User.findById(userId)
      const cart = user.cart 
      if(cart.lenght === 0){
        return res.status(200).send("Cart is empty!")
      } 
      let totalAmount = 0;
      const products = [];
  
      for (const item of cart) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(404).json({ error: "Product not found" });
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
      return res.status(201).json({ message: "Order created successfully", order: newOrder });
    } catch (err) {
      res.status(500).send(err.message);
    }
  };

exports.createPayment = async (req, res) => {
  try {
      const { userId, orderId, paymentMethodId } = req.body;

      if (!userId || !orderId || !paymentMethodId) {
          return res.status(400).json({ error: "Missing required fields" });
      }

      const order = await Order.findById(orderId);
      if (!order) {
          return res.status(404).send("Order not found");
      }

      const paymentIntent = await stripe.paymentIntents.create({
          amount: order.totalAmount * 100, // Convert to cents
          currency: "qar",
          payment_method: paymentMethodId,
          // confirmation_method: "manual",
          confirm: true,
          automatic_payment_methods: {
              enabled: true,
              allow_redirects: "never" // Prevents redirect-based payment methods
          }
      });

      const payment = new Payment({
          user: userId,
          order: orderId,
          amount: order.totalAmount,
          status: "pending",
          transactionId: paymentIntent.id,
          paymentMethod: paymentMethodId,
      });

      await payment.save();

      if (paymentIntent.status === "succeeded") {
          order.status = "paid";
          await order.save();

          payment.status = "completed";
          await payment.save();

          return res.status(200).json({ message: "Payment successful", payment, order });
      } else {
          return res.status(400).json({ error: "Payment failed" });
      }

  } catch (err) {
      return res.status(500).send(err.message);
  }
};



  