// payment_flow.js

document.addEventListener('DOMContentLoaded', async () => {
    const paymentOptions = document.querySelectorAll('.payment-option');
    const creditCardDetails = document.getElementById('credit-card-details');
    const creditCardForm = document.getElementById('credit-card-form');
    // const cardNumberInput = document.getElementById('cardNumber'); // No longer needed
    // const cardExpiryInput = document.getElementById('cardExpiry'); // No longer needed
    // const cardCVCInput = document.getElementById('cardCVC'); // No longer needed
    const subscribeButtons = document.querySelectorAll('.subscribe-button');
    const currentPlanSpan = document.getElementById('current-plan');
    const manageSubscriptionButton = document.getElementById('manage-subscription');
    const cancelSubscriptionButton = document.getElementById('cancel-subscription');
    const paymentConfirmation = document.getElementById('payment-confirmation');
    const paymentError = document.getElementById('payment-error');
    const errorMessage = document.getElementById('error-message');

    const backendUrl = window.location.origin; // Dynamically determine backend URL

    // Fetch Stripe Publishable Key securely from backend
    let stripePublishableKey;
    try {
        const response = await fetch(`${backendUrl}/api/stripe-config`);
        const data = await response.json();
        if (data.publishableKey) {
            stripePublishableKey = data.publishableKey;
        } else {
            console.error('Failed to load Stripe Publishable Key from backend.');
            showMessage(paymentError, 'Failed to load payment configuration. Please try again later.', 'error');
            return; // Halt execution if key isn't available
        }
    } catch (error) {
        console.error('Error fetching Stripe config:', error);
        showMessage(paymentError, 'Failed to connect to payment services. Please try again later.', 'error');
        return; // Halt execution if fetch fails
    }

    const stripe = Stripe(stripePublishableKey);
    const elements = stripe.elements();

    let selectedPaymentMethod = null;
    let userCustomerId = localStorage.getItem('userCustomerId') || null;
    let userSubscriptionId = localStorage.getItem('userSubscriptionId') || null;
    let userSubscription = null; // Object to store subscription details

    // --- Helper Functions ---
    function showMessage(element, message = '', type = 'success') {
        element.style.display = 'block';
        if (message) {
            if (type === 'error') {
                errorMessage.textContent = message;
            }
        }
        setTimeout(() => {
            element.style.display = 'none';
            errorMessage.textContent = 'Please check your details and try again.'; // Reset default error message
        }, 5000);
    }

    async function updateSubscriptionUI() {
        if (userSubscriptionId) {
            try {
                const response = await fetch(`${backendUrl}/api/retrieve-subscription/${userSubscriptionId}`);
                if (response.ok) {
                    userSubscription = await response.json();
                    currentPlanSpan.textContent = userSubscription.plan.nickname || 'Unknown Plan'; // Stripe price nickname
                    manageSubscriptionButton.style.display = 'inline-block';
                    cancelSubscriptionButton.style.display = 'inline-block';
                    subscribeButtons.forEach(button => button.style.display = 'none');
                } else {
                    console.error('Failed to retrieve subscription:', response.statusText);
                    userSubscriptionId = null; // Invalidate if not found
                    localStorage.removeItem('userSubscriptionId');
                    updateSubscriptionUI(); // Retry with no subscription
                }
            } catch (error) {
                console.error('Error fetching subscription:', error);
                userSubscriptionId = null;
                localStorage.removeItem('userSubscriptionId');
                updateSubscriptionUI(); // Retry with no subscription
            }
        } else {
            currentPlanSpan.textContent = 'None';
            manageSubscriptionButton.style.display = 'none';
            cancelSubscriptionButton.style.display = 'none';
            subscribeButtons.forEach(button => button.style.display = 'inline-block');
        }
    }

    // --- Core Payment Functions ---

    // Handles one-time payment using Payment Intents
    async function createPaymentIntent(amount, currency, customerId) {
        try {
            const { paymentMethod, error } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            if (error) {
                showMessage(paymentError, error.message, 'error');
                return;
            }

            const response = await fetch(`${backendUrl}/api/create-payment-intent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    currency,
                    paymentMethodType: 'card',
                    customerId,
                    paymentMethodId: paymentMethod.id, // Pass PaymentMethod ID to backend
                }),
            });

            const paymentIntentData = await response.json();

            if (paymentIntentData.error) {
                showMessage(paymentError, paymentIntentData.error, 'error');
                return;
            }

            const { clientSecret } = paymentIntentData;
            const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                },
            });

            if (confirmError) {
                showMessage(paymentError, confirmError.message, 'error');
            } else if (paymentIntent.status === 'succeeded') {
                showMessage(paymentConfirmation, 'Payment Successful!');
                // In a real app, you'd update UI based on backend confirmation (e.g., webhook)
                creditCardForm.reset();
            }

        } catch (error) {
            console.error('Payment intent error:', error);
            showMessage(paymentError, 'An unexpected error occurred during payment.', 'error');
        }
    }

    // Handles subscription creation
    async function createSubscription(planId) {
        try {
            // 1. Ensure customer exists or create one
            if (!userCustomerId) {
                // For demo, use a dummy email. In real app, get user's email.
                const customerResponse = await fetch(`${backendUrl}/api/create-customer`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: `user-${Date.now()}@example.com` }),
                });
                const customerData = await customerResponse.json();
                if (customerData.error) {
                    showMessage(paymentError, customerData.error, 'error');
                    return;
                }
                userCustomerId = customerData.customerId;
                localStorage.setItem('userCustomerId', userCustomerId);
            }

            // 2. Create Payment Method (if not already done via createPaymentIntent)
            const { paymentMethod, error } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            if (error) {
                showMessage(paymentError, error.message, 'error');
                return;
            }

            // 3. Create Subscription on backend
            // For demo, map planId to a Stripe Price ID (these would be created in Stripe Dashboard)
            const priceMap = {
                basic: 'price_1Oxxxxxxxxxxxxxx', // Replace with actual Stripe Price IDs
                premium: 'price_1Pxxxxxxxxxxxxxx',
            };
            const priceId = priceMap[planId];
            if (!priceId) {
                showMessage(paymentError, 'Invalid plan selected.', 'error');
                return;
            }

            const subscriptionResponse = await fetch(`${backendUrl}/api/create-subscription`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: userCustomerId,
                    priceId: priceId,
                    paymentMethodId: paymentMethod.id, // Pass payment method for initial payment
                }),
            });

            const subscriptionData = await subscriptionResponse.json();

            if (subscriptionData.error) {
                showMessage(paymentError, subscriptionData.error, 'error');
                return;
            }

            const { subscriptionId, clientSecret } = subscriptionData;
            userSubscriptionId = subscriptionId;
            localStorage.setItem('userSubscriptionId', userSubscriptionId);

            // 4. Confirm card payment for initial invoice (if required)
            if (clientSecret) {
                const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
                    payment_method: {
                        card: cardElement,
                    },
                });

                if (confirmError) {
                    showMessage(paymentError, confirmError.message, 'error');
                    return;
                }

                if (paymentIntent.status === 'succeeded') {
                    showMessage(paymentConfirmation, `Successfully subscribed to the ${planId} plan!`);
                    updateSubscriptionUI();
                } else {
                    showMessage(paymentError, 'Subscription payment failed. Please try again.', 'error');
                }
            } else {
                // No immediate payment required (e.g., trial period, or card already on file)
                showMessage(paymentConfirmation, `Successfully subscribed to the ${planId} plan!`);
                updateSubscriptionUI();
            }
        } catch (error) {
            console.error('Subscription error:', error);
            showMessage(paymentError, 'An unexpected error occurred during subscription.', 'error');
        }
    }

    // Handles subscription cancellation
    async function cancelUserSubscription() {
        if (!userSubscriptionId) {
            showMessage(paymentError, 'No active subscription to cancel.', 'error');
            return;
        }

        if (confirm('Are you sure you want to cancel your subscription?')) {
            try {
                const response = await fetch(`${backendUrl}/api/cancel-subscription`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ subscriptionId: userSubscriptionId }),
                });

                const data = await response.json();

                if (data.error) {
                    showMessage(paymentError, data.error, 'error');
                } else {
                    userSubscriptionId = null;
                    localStorage.removeItem('userSubscriptionId');
                    showMessage(paymentConfirmation, 'Your subscription has been cancelled.');
                    updateSubscriptionUI();
                }
            } catch (error) {
                console.error('Error cancelling subscription:', error);
                showMessage(paymentError, 'An unexpected error occurred during cancellation.', 'error');
            }
        }
    }


    // --- Event Listeners ---

    // Payment Method Selection
    paymentOptions.forEach(option => {
        option.addEventListener('click', () => {
            paymentOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedPaymentMethod = option.dataset.method;

            // Hide all payment details sections initially
            creditCardDetails.style.display = 'none';

            // Show relevant payment details section
            if (selectedPaymentMethod === 'credit-card') {
                creditCardDetails.style.display = 'block';
                cardElement.update({}); // Ensure card element is ready
            } else if (selectedPaymentMethod === 'paypal') {
                alert('Redirecting to PayPal for secure payment...');
                // In a real application, you would redirect to PayPal's secure gateway
            } else if (selectedPaymentMethod === 'apple-pay') {
                alert('Initiating Apple Pay...');
                // Implement Apple Pay integration
            } else if (selectedPaymentMethod === 'google-pay') {
                alert('Initiating Google Pay...');
                // Implement Google Pay integration
            }
        });
    });

    // Credit Card Form Submission (now handles one-time payments)
    creditCardForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        paymentConfirmation.style.display = 'none';
        paymentError.style.display = 'none';

        // For demo, assume a fixed amount and currency for one-time payments
        await createPaymentIntent(1000, 'usd', userCustomerId); // Amount in cents (e.g., $10.00)
    });

    // Subscribe Button Actions
    subscribeButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const planId = event.target.dataset.planId;
            console.log(`Attempting to subscribe to ${planId} plan...`);

            if (!selectedPaymentMethod) {
                showMessage(paymentError, 'Please select a payment method first.', 'error');
                return;
            }
            if (selectedPaymentMethod !== 'credit-card') {
                showMessage(paymentError, 'Only credit card subscriptions are supported in this demo.', 'error');
                return;
            }

            await createSubscription(planId);
        });
    });

    // Manage Subscription Button Action (for now, just an alert)
    manageSubscriptionButton.addEventListener('click', () => {
        alert('Redirecting to subscription management page/modal...');
        // In a real app, navigate to a dedicated page or open a modal for subscription management.
    });

    // Cancel Subscription Button Action
    cancelSubscriptionButton.addEventListener('click', async () => {
        await cancelUserSubscription();
    });

    // Initialize UI on load
    await updateSubscriptionUI(); // Use await as it's now async
});