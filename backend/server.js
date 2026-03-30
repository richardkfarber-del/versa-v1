
require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors'); // Required for cross-origin requests
const rateLimit = require('express-rate-limit'); // For rate limiting
const { body: checkBody, param, validationResult } = require('express-validator'); // For input validation

const PORT = process.env.PORT || 10000;

// Ensure Stripe Secret Key is loaded securely
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
    console.error('CRITICAL ERROR: STRIPE_SECRET_KEY is not set in environment variables.');
    process.exit(1); // Exit if critical environment variable is missing
}
const stripe = require('stripe')(stripeSecretKey);

const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
if (!stripePublishableKey) {
    console.error('CRITICAL ERROR: STRIPE_PUBLISHABLE_KEY is not set in environment variables.');
    }


// Ensure Stripe Webhook Secret is loaded securely
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (!stripeWebhookSecret) {
    console.warn('WARNING: STRIPE_WEBHOOK_SECRET is not set. Webhook verification will fail if not provided.');
}

// Database Connection Logic (Placeholder for graceful degradation)
try {
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
        // Simulate database connection attempt
        // In a real app, this would be actual DB client connection (e.g., mongoose.connect, pg.Pool)
        console.log(`Attempting to connect to database at: ${databaseUrl}`);
        // For demonstration, we'll assume a successful connection if the URL exists
        // In a real scenario, you'd await an actual connection method here
        // If it fails, the catch block will execute
        if (databaseUrl.includes('localhost') && process.env.NODE_ENV === 'production') {
            throw new Error('Database URL points to localhost in production environment.');
        }
        console.log('Database connection attempt successful (placeholder).');
    } else {
        console.warn('WARNING: DATABASE_URL is not set. Database operations may fail.');
    }
} catch (error) {
    console.warn(`WARNING: Database connection failed: ${error.message}. The application will continue to run without database connectivity.`);
    // The application continues to run
}

// Redis Connection Logic (Placeholder for graceful degradation)
try {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
        // Simulate Redis connection attempt
        // In a real app, this would be actual Redis client connection (e.g., new Redis(redisUrl))
        console.log(`Attempting to connect to Redis at: ${redisUrl}`);
        // For demonstration, we'll assume a successful connection if the URL exists
        // In a real scenario, you'd await an actual connection method here
        // If it fails, the catch block will execute
        if (redisUrl.includes('localhost') && process.env.NODE_ENV === 'production') {
            throw new Error('Redis URL points to localhost in production environment.');
        }
        console.log('Redis connection attempt successful (placeholder).');
    } else {
        console.warn('WARNING: REDIS_URL is not set. Caching and session management may be affected.');
    }
} catch (error) {
    console.warn(`WARNING: Redis connection failed: ${error.message}. The application will continue to run without Redis connectivity.`);
    // The application continues to run
}

// CORS Configuration: Restrict to trusted origins in production
// For development, allowing all origins is common.
// In production, replace '*' with your frontend's URL (e.g., 'https://yourdomain.com')
app.use(cors({
    origin: ['http://localhost:3000', 'https://yourproductiondomain.com'], // CRITICAL FIX: Restrict to trusted origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting middleware for public-facing API endpoints
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Placeholder for Authentication/Authorization middleware
// In a real application, this would involve JWT verification, session checks, etc.
const authenticateUser = (req, res, next) => {
    // CRITICAL FIX: Implement robust authentication and authorization logic.
    // This is a placeholder for a real-world JWT or session-based authentication.
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn('Authentication failed: No token provided or malformed header.');
        return res.status(401).json({ error: 'Unauthorized: No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    // In a real application, verify the token (e.g., JWT.verify(token, process.env.JWT_SECRET))
    // For this example, we'll use a very basic check (e.g., a hardcoded token for demonstration).
    // DO NOT use hardcoded tokens in production.
    if (token === process.env.AUTH_TOKEN) { // Assuming AUTH_TOKEN is set in .env
        console.log('Authentication successful: User authorized.');
        // In a real app, you'd attach user info to req.user here
        next();
    } else {
        console.warn('Authentication failed: Invalid token.');
        return res.status(403).json({ error: 'Forbidden: Invalid token.' });
    }
};

// Apply rate limiting to all /api/* routes except the webhook
app.use('/api', apiLimiter);

// For all non-webhook routes, parse JSON bodies
app.use((req, res, next) => {
    if (req.originalUrl === '/api/webhook') {
        next(); // Skip bodyParser.json() for webhook endpoint
    } else {
        bodyParser.json()(req, res, next);
    }
});


// --- Backend Payment API Endpoints ---

// CRITICAL FIX: Implement robust server-side input validation middleware
const validateInput = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.warn('Input validation failed:', errors.array());
        return res.status(400).json({ errors: errors.array(), message: 'Invalid request parameters.' }); // More generic error message
    }
    next();
};

// --- Backend Payment API Endpoints ---

// 1. Create Payment Intent (for one-time payments)
app.post('/api/create-payment-intent', 
    authenticateUser,
    [
        checkBody('amount').isNumeric().withMessage('Amount must be a number.').toInt(),
        checkBody('currency').isString().trim().notEmpty().withMessage('Currency is required.'),
        checkBody('paymentMethodType').isString().trim().notEmpty().withMessage('Payment method type is required.'),
        // customerId is optional, so no direct validation needed unless it must conform to a format if present
    ],
    validateInput,
    async (req, res) => {
    const { amount, currency, paymentMethodType, customerId } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency,
            payment_method_types: [paymentMethodType],
            customer: customerId, // Optional: if you have a customer ID
        });
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating payment intent:', error.message);
        res.status(500).json({ error: 'An unexpected error occurred while creating payment intent.' });
    }
});

// 2. Create a Customer (if not already existing) - useful for subscriptions
app.post('/api/create-customer', 
    authenticateUser,
    [
        checkBody('email').isEmail().withMessage('Valid email is required.'),
    ],
    validateInput,
    async (req, res) => {
    const { email } = req.body;

    try {
        const customer = await stripe.customers.create({
            email: email,
        });
        res.json({ customerId: customer.id });
    } catch (error) {
        console.error('Error creating customer:', error.message);
        res.status(500).json({ error: 'An unexpected error occurred while creating customer.' });
    }
});

// 3. Create Subscription
app.post('/api/create-subscription', 
    authenticateUser,
    [
        checkBody('customerId').isString().trim().notEmpty().withMessage('Customer ID is required.'),
        checkBody('priceId').isString().trim().notEmpty().withMessage('Price ID is required.'),
    ],
    validateInput,
    async (req, res) => {
    const { customerId, priceId } = req.body;

    try {
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            expand: ['latest_invoice.payment_intent'],
        });
        res.json({
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        });
    } catch (error) {
        console.error('Error creating subscription:', error.message);
        res.status(500).json({ error: 'An unexpected error occurred while creating subscription.' });
    }
});

// 4. Retrieve Subscription
app.get('/api/retrieve-subscription/:subscriptionId', 
    authenticateUser,
    [
        param('subscriptionId').isString().trim().notEmpty().withMessage('Subscription ID is required.'),
    ],
    validateInput,
    async (req, res) => {
    const { subscriptionId } = req.params;

    try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        res.json(subscription);
    } catch (error) {
        console.error('Error retrieving subscription:', error.message);
        res.status(500).json({ error: 'An unexpected error occurred while retrieving subscription.' });
    }
});

// 5. Cancel Subscription
app.post('/api/cancel-subscription', 
    authenticateUser,
    [
        checkBody('subscriptionId').isString().trim().notEmpty().withMessage('Subscription ID is required.'),
    ],
    validateInput,
    async (req, res) => {
    const { subscriptionId } = req.body;

    try {
        const cancelledSubscription = await stripe.subscriptions.cancel(subscriptionId);
        res.json(cancelledSubscription);
    } catch (error) {
        console.error('Error cancelling subscription:', error.message);
        res.status(500).json({ error: 'An unexpected error occurred while cancelling subscription.' });
    }
});

// New endpoint to provide Stripe Publishable Key to frontend securely
app.get('/api/stripe-config', (req, res) => {
    if (stripePublishableKey) {
        res.json({ publishableKey: stripePublishableKey });
    } else {
        console.error('Stripe Publishable Key not available.');
        res.status(500).json({ error: 'Stripe configuration not available.' });
    }
});

// --- Webhook Endpoint ---
// Stripe will send events to this endpoint
app.post('/api/webhook', bodyParser.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    // CRITICAL FIX: Implement webhook signature verification
    try {
        if (!stripeWebhookSecret) {
            throw new Error('Stripe Webhook Secret is not configured. Webhook verification aborted.');
        }
        event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
    } catch (err) {
        console.error(`Webhook Signature Verification Error: ${err.message}`);
        // Return a generic error to the client to avoid leaking information
        return res.status(400).send('Webhook Error: Signature verification failed.');
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntentSucceeded = event.data.object;
            console.log('PaymentIntent was successful:', paymentIntentSucceeded);
            // TODO: Update your database, fulfill order, send confirmation email, etc.
            break;
        case 'payment_method.attached':
            const paymentMethod = event.data.object;
            console.log('PaymentMethod was attached to a Customer:', paymentMethod);
            // TODO: Associate this payment method with a user in your DB
            break;
        case 'customer.subscription.created':
            const subscriptionCreated = event.data.object;
            console.log('Subscription created:', subscriptionCreated);
            // TODO: Update user's subscription status in DB
            break;
        case 'customer.subscription.updated':
            const subscriptionUpdated = event.data.object;
            console.log('Subscription updated:', subscriptionUpdated);
            // TODO: Handle plan changes, renewals, etc.
            break;
        case 'customer.subscription.deleted':
            const subscriptionDeleted = event.data.object;
            console.log('Subscription deleted:', subscriptionDeleted);
            // TODO: Mark user's subscription as cancelled in DB
            break;
        case 'charge.refunded':
            const chargeRefunded = event.data.object;
            console.log('Charge refunded:', chargeRefunded);
            // TODO: Update transaction status, notify user
            break;
        // ... handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
});

// Serve the static frontend files
app.use(express.static(require('path').join(__dirname, '../frontend')));

// Route the root URL to the UI
app.get('/', (req, res) => {
  res.sendFile(require('path').join(__dirname, '../frontend/payment_ui.html'));
});
app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
});
