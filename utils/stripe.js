const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);  // Replace with your secret key

const createTestPaymentMethod = async () => {
  const paymentMethod = await stripe.paymentMethods.create({
    type: 'card',
    card: {
      number: '4242424242424242',  // Test card number for successful payment
      exp_month: 12,
      exp_year: 2025,
      cvc: '123',
    },
  });

  console.log(paymentMethod.id);  // Log or save the paymentMethodId to use in your tests
  return paymentMethod.id;
};

createTestPaymentMethod();
