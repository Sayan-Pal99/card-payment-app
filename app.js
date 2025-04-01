require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// Validate Stripe API keys
if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PUBLIC_KEY) {
  console.error('Error: Stripe API keys are missing. Please check your .env file.');
  process.exit(1);
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
app.get('/', (req, res) => {
  res.render('index', {
    stripePublicKey: process.env.STRIPE_PUBLIC_KEY
  });
});

app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency } = req.body;
    
    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }
    
    // Create a PaymentIntent with the specified amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents and ensure integer
      currency: currency || 'usd',
      payment_method_types: ['card']
    });

    // Send the client secret to the client
    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/payment-success', (req, res) => {
  // Handle successful payment logic here
  // You might save to database, send confirmation email, etc.
  const { amount = 10.00 } = req.body;
  res.render('success', { 
    amount: parseFloat(amount).toFixed(2),
    transactionId: Math.floor(100000000 + Math.random() * 900000000)
  });
});

// Also handle GET requests to the success page for redirects
app.get('/payment-success', (req, res) => {
  const amount = req.query.amount || 10.00;
  res.render('success', { 
    amount: parseFloat(amount).toFixed(2),
    transactionId: Math.floor(100000000 + Math.random() * 900000000)
  });
});

// Handle payment failures
app.post('/payment-failure', (req, res) => {
  const { error = 'Your payment could not be processed' } = req.body;
  res.render('failure', { errorMessage: error });
});

// Handle GET requests to failure page
app.get('/payment-failure', (req, res) => {
  const error = req.query.error || 'Your payment could not be processed';
  res.render('failure', { errorMessage: error });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 