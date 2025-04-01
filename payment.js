document.addEventListener('DOMContentLoaded', function() {
  // Initialize Stripe with the public key from the data attribute
  const stripePublicKey = document.getElementById('payment-form').dataset.stripeKey;
  const stripe = Stripe(stripePublicKey);
  const elements = stripe.elements();
  
  // Custom styling
  const style = {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a'
    }
  };
  
  // Create and mount the individual card elements
  const cardNumber = elements.create('cardNumber', { style: style });
  cardNumber.mount('#card-number');
  
  const cardExpiry = elements.create('cardExpiry', { style: style });
  cardExpiry.mount('#card-expiry');
  
  const cardCvc = elements.create('cardCvc', { style: style });
  cardCvc.mount('#card-cvc');
  
  // Get DOM elements
  const form = document.getElementById('payment-form');
  const submitButton = document.getElementById('submit-payment');
  const processingElement = document.getElementById('payment-processing');
  const errorElement = document.getElementById('payment-error');
  const errorMessage = document.getElementById('error-message');
  const postalCodeInput = document.getElementById('postal-code');
  const amountInput = document.getElementById('amount');
  const amountError = document.getElementById('amount-error');
  const cardNameInput = document.getElementById('card-name');
  
  // Add validation to amount input
  amountInput.addEventListener('input', function(e) {
    validateAmount();
  });
  
  // Validate amount
  function validateAmount() {
    const amount = amountInput.value.trim();
    amountError.classList.add('hidden');
    
    if (!amount || parseFloat(amount) <= 0) {
      amountError.textContent = 'Please enter a valid amount';
      amountError.classList.remove('hidden');
      return false;
    }
    return true;
  }
  
  // Validate name
  function validateName() {
    const name = cardNameInput.value.trim();
    
    if (!name) {
      showError('Please enter the cardholder name');
      return false;
    }
    return true;
  }
  
  // Add validation to postal code input
  postalCodeInput.addEventListener('input', function(e) {
    // Allow only digits
    this.value = this.value.replace(/[^\d]/g, '');
    
    // Limit to 6 digits
    if (this.value.length > 6) {
      this.value = this.value.slice(0, 6);
    }
  });
  
  // Handle form submission
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const amount = amountInput.value.trim();
    const postalCode = postalCodeInput.value.trim();
    const cardholderName = cardNameInput.value.trim();
    
    // Validate amount
    if (!validateAmount()) {
      amountInput.focus();
      return;
    }
    
    // Validate name
    if (!validateName()) {
      cardNameInput.focus();
      return;
    }
    
    // Validate postal code
    if (!postalCode || postalCode.length !== 6) {
      showError('Please enter your 6-digit postal code');
      postalCodeInput.focus();
      return;
    }
    
    // Disable the submit button during the request
    submitButton.disabled = true;
    submitButton.textContent = 'Processing...';
    processingElement.classList.remove('hidden');
    processingElement.setAttribute('aria-hidden', 'false');
    errorElement.classList.add('hidden');
    
    try {
      // Create the PaymentIntent on the server
      const response = await fetch('/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency: 'usd'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong with your payment');
      }
      
      const data = await response.json();
      const { clientSecret } = data;
      
      // Confirm the payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumber,
          billing_details: {
            name: cardholderName,
            address: {
              postal_code: postalCode
            }
          }
        }
      });
      
      if (result.error) {
        // Redirect to failure page with error message
        window.location.href = `/payment-failure?error=${encodeURIComponent(result.error.message)}`;
      } else {
        // Payment succeeded
        processingElement.classList.add('hidden');
        
        // Redirect to success page with amount
        window.location.href = `/payment-success?amount=${encodeURIComponent(amount)}`;
      }
    } catch (error) {
      // Redirect to failure page with error message
      window.location.href = `/payment-failure?error=${encodeURIComponent(error.message)}`;
    }
  });
  
  function showError(message) {
    processingElement.classList.add('hidden');
    processingElement.setAttribute('aria-hidden', 'true');
    errorElement.classList.remove('hidden');
    errorMessage.textContent = message;
    submitButton.disabled = false;
    submitButton.textContent = 'Pay Now';
  }
  
  // Handle card element changes
  [cardNumber, cardExpiry, cardCvc].forEach(element => {
    element.on('change', (event) => {
      const displayError = document.getElementById('card-errors');
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = '';
      }
    });
  });
}); 