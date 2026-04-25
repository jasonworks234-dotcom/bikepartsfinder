const express = require('express');
const stripe = require('stripe')('sk_test_51YOUR_SECRET_KEY_HERE51');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let sellers = [];

app.get('/api/sellers', (req, res) => res.json(sellers));
app.post('/api/sellers', (req, res) => {
    const seller = { id: Date.now(), ...req.body, createdAt: new Date() };
    sellers.push(seller);
    res.json(seller);
});

app.post('/create-checkout-session', async (req, res) => {
    const prices = { basic: 999, pro: 2999, enterprise: 9999 };
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency: 'usd',
                product_data: { name: `${req.body.plan} Seller Plan` },
                unit_amount: prices[req.body.plan],
                recurring: { interval: 'month' }
            },
            quantity: 1
        }],
        mode: 'subscription',
        success_url: `${req.headers.origin}/success`,
        cancel_url: `${req.headers.origin}/cancel`,
        metadata: { plan: req.body.plan }
    });
    res.json({ sessionId: session.id });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(process.env.PORT || 3000, () => console.log('🚀 LIVE'));
