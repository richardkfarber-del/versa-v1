import os
import stripe
from flask import Blueprint, request, jsonify
from services.auth import require_auth
from services.db import get_user_data, get_db_connection
import posthog

billing_bp = Blueprint('billing', __name__)

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

@billing_bp.route('/api/create-checkout-session', methods=['POST'])
@require_auth
def create_checkout_session(clerk_user_id):
    if not clerk_user_id:
        return jsonify({"error": "Login required"}), 401
    try:
        price_id = os.getenv("STRIPE_PRICE_ID")
        base_url = request.host_url.rstrip('/')
        
        checkout_session = stripe.checkout.Session.create(
            client_reference_id=clerk_user_id,
            line_items=[
                {
                    'price': price_id,
                    'quantity': 1,
                },
            ],
            mode='subscription',
            success_url=f"{base_url}/?success=true",
            cancel_url=f"{base_url}/?canceled=true",
        )
        posthog.capture(clerk_user_id, 'checkout_session_created')
        return jsonify({'url': checkout_session.url})
    except Exception as e:
        from flask import current_app
        current_app.logger.error(f"Stripe/Clerk checkout error: {e}")
        try:
            posthog.capture(distinct_id=clerk_user_id, event='checkout_session_error', properties={'error': str(e)})
        except Exception as ph_err:
            current_app.logger.error(f"PostHog capture error: {ph_err}")
        return jsonify(error=str(e)), 500

@billing_bp.route('/api/create-portal-session', methods=['POST'])
@require_auth
def create_portal_session(clerk_user_id):
    if not clerk_user_id:
        return jsonify({"error": "Login required"}), 401
    tier, usage_count, stripe_customer_id, github_token = get_user_data(clerk_user_id)
    if not stripe_customer_id:
        return jsonify({"error": "No Stripe customer found. Please subscribe first."}), 400
    
    try:
        base_url = request.host_url.rstrip('/')
        portal_session = stripe.billing_portal.Session.create(
            customer=stripe_customer_id,
            return_url=f"{base_url}/",
        )
        return jsonify({'url': portal_session.url})
    except Exception as e:
        return jsonify(error=str(e)), 500

@billing_bp.route('/api/webhook', methods=['POST'])
def webhook():
    payload = request.get_data()
    sig_header = request.headers.get('Stripe-Signature')
    event = None

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError as e:
        return 'Invalid payload', 400
    except stripe.error.SignatureVerificationError as e:
        return 'Invalid signature', 400

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        clerk_user_id = session.get('client_reference_id')
        customer_id = session.get('customer')
        
        if clerk_user_id:
            conn = get_db_connection()
            try:
                with conn:
                    with conn.cursor() as cursor:
                        cursor.execute(
                            'UPDATE users SET tier = %s, stripe_customer_id = %s WHERE clerk_user_id = %s',
                            ('Pro', customer_id, clerk_user_id)
                        )
            finally:
                conn.close()
            posthog.capture(clerk_user_id, 'subscription_upgraded')

    return jsonify(success=True)
