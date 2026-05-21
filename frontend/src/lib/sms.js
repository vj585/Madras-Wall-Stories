/**
 * SMS Notification — Madras Wall Stories
 *
 * Provider: Fast2SMS (India — simple, no DLT hassle for transactional SMS)
 * Fallback: Configurable via SMS_PROVIDER env var ('fast2sms' | 'twilio' | 'msg91')
 *
 * Fast2SMS docs: https://docs.fast2sms.com
 * Set SMS_PROVIDER=fast2sms and SMS_API_KEY=<your key> in .env.local
 */

function shortOrderId(order) {
  return (order._id || order.id || '').toString().slice(-6).toUpperCase();
}

function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

// ─── Fast2SMS ────────────────────────────────────────────────────────────────
async function sendVisFast2SMS({ phone, message }) {
  const apiKey = process.env.SMS_API_KEY;
  if (!apiKey) throw new Error('SMS_API_KEY is not set for Fast2SMS.');

  // Fast2SMS Quick SMS (DLT not required for quick route in test mode)
  const url = 'https://www.fast2sms.com/dev/bulkV2';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      authorization: apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      route: 'q',                         // quick route
      message,
      language: 'english',
      flash: 0,
      numbers: phone.replace(/\D/g, ''), // digits only
    }),
  });
  const data = await response.json();
  if (!data.return) {
    throw new Error(`Fast2SMS error: ${JSON.stringify(data)}`);
  }
  return data;
}

// ─── Twilio (alternative) ────────────────────────────────────────────────────
async function sendViaTwilio({ phone, message }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const from       = process.env.TWILIO_PHONE_NUMBER;
  if (!accountSid || !authToken || !from) throw new Error('Twilio env vars missing.');

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const body = new URLSearchParams({ To: phone, From: from, Body: message });
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  const data = await response.json();
  if (data.error_code) throw new Error(`Twilio error: ${data.error_message}`);
  return data;
}

// ─── MSG91 (alternative) ────────────────────────────────────────────────────
async function sendViaMSG91({ phone, message }) {
  const apiKey   = process.env.SMS_API_KEY;
  const senderId = process.env.SMS_SENDER_ID || 'MWSORD';
  if (!apiKey) throw new Error('SMS_API_KEY is not set for MSG91.');

  const url = 'https://api.msg91.com/api/v5/flow/';
  const response = await fetch(url, {
    method: 'POST',
    headers: { authkey: apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      template_id: process.env.MSG91_TEMPLATE_ID || '',
      short_url: 0,
      recipients: [{ mobiles: `91${phone.replace(/\D/g, '').slice(-10)}`, message }],
    }),
  });
  const data = await response.json();
  if (data.type !== 'success') throw new Error(`MSG91 error: ${JSON.stringify(data)}`);
  return data;
}

// ─── Main send function ───────────────────────────────────────────────────────
export async function sendOrderSMS(order) {
  try {
    const phone = order.phone;
    if (!phone || phone === '0000000000') {
      console.log('[SMS] Skipped — no valid phone number for order:', shortOrderId(order));
      return;
    }

    const orderId = shortOrderId(order);
    const amount  = formatCurrency(order.amount);
    const method  = order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Paid';

    const message = `Madras Wall Stories: Order #${orderId} confirmed! Amount ${amount} (${method}). We'll notify you when your order moves forward. Thank you! 🎨`;

    const provider = (process.env.SMS_PROVIDER || 'fast2sms').toLowerCase();

    if (provider === 'twilio') {
      await sendViaTwilio({ phone, message });
    } else if (provider === 'msg91') {
      await sendViaMSG91({ phone, message });
    } else {
      // Default: Fast2SMS
      await sendVisFast2SMS({ phone, message });
    }

    console.log(`[SMS] Order confirmation sent to ${phone} for order #${orderId}`);
  } catch (err) {
    // Phase 6: Failure safety — log but NEVER throw, order must still succeed
    console.error('[SMS] Failed to send order confirmation SMS:', err.message);
  }
}
