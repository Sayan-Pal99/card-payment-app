# Card Payment Application

A simple Node.js application for processing card payments using Stripe.

## Features

- Clean and responsive payment form
- Secure card processing with Stripe Elements
- Real-time card validation
- Success page after payment completion

## Requirements

- Node.js (v14 or higher)
- Stripe account (for API keys)

## Installation

1. Clone this repository:
   ```
   git clone <repository-url>
   cd card-payment-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure your environment variables:
   - Rename `.env.example` to `.env` (if applicable)
   - Update the `.env` file with your Stripe API keys:
     ```
     STRIPE_PUBLIC_KEY=pk_test_your_public_key
     STRIPE_SECRET_KEY=sk_test_your_secret_key
     ```

## Running the Application

Start the development server:
```
npm run dev
```

For production:
```
npm start
```

The application will be available at `http://localhost:3000`.

## How It Works

1. The customer enters their payment amount
2. They input their card details into the Stripe Elements form
3. Upon submission, a payment intent is created on the server
4. The payment is confirmed on the client side with Stripe.js
5. If successful, the customer is redirected to a success page

## Testing

You can test the payment functionality using Stripe's test cards:

- Card number: 4242 4242 4242 4242
- Expiry date: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

For more test cards, visit [Stripe's testing documentation](https://stripe.com/docs/testing).

## Security

This application follows Stripe's best practices for handling card data:
- No card data is stored on your server
- All sensitive information is processed directly by Stripe
- Communication with Stripe API is done securely

## License

This project is licensed under the ISC License. 