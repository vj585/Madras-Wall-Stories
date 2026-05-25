import nodemailer from 'nodemailer';

// ─── Transport ─────────────────────────────────────────────────────────────
function createTransport() {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD } = process.env;
  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASSWORD) {
    throw new Error('Email environment variables are not configured (EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD).');
  }
  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT) || 587,
    secure: Number(EMAIL_PORT) === 465,
    auth: { user: EMAIL_USER, pass: EMAIL_PASSWORD },
  });
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatAddress(addr) {
  if (!addr) return '—';
  return [addr.address1, addr.address2, addr.city, addr.state, addr.pincode, addr.country || 'India']
    .filter(Boolean).join(', ');
}

function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

function shortOrderId(order) {
  return (order._id || order.id || '').toString().slice(-6).toUpperCase();
}

// ─── HTML Template ──────────────────────────────────────────────────────────
function buildOrderEmailHTML({ order, isAdmin = false }) {
  const orderId = shortOrderId(order);
  const products = order.products || [];

  const productRows = products.map(p => `
    <tr style="border-bottom:1px solid #e8e4dc;">
      <td style="padding:14px 0;vertical-align:top;">
        <div style="font-weight:700;color:#1a1a2e;font-size:14px;">${p.title || 'Product'}${p.isCustom ? ' <span style="font-size:11px;background:#1a1a2e;color:#d4af37;padding:2px 7px;border-radius:20px;font-weight:600;">CUSTOM</span>' : ''}</div>
        <div style="font-size:12px;color:#888;margin-top:4px;">
          ${[p.size, p.frame, p.customDetails?.finish].filter(Boolean).join(' · ')}
          ${p.customDetails?.caption ? `<br/><em>"${p.customDetails.caption}"</em>` : ''}
        </div>
      </td>
      <td style="padding:14px 8px;text-align:center;color:#555;font-size:14px;vertical-align:top;">×${p.quantity}</td>
      <td style="padding:14px 0;text-align:right;font-weight:700;color:#1a1a2e;font-size:14px;vertical-align:top;">${formatCurrency(p.price * p.quantity)}</td>
    </tr>
  `).join('');

  const subtotal = order.amount;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${isAdmin ? 'New Order Received' : 'Your order is confirmed!'}</title>
</head>
<body style="margin:0;padding:0;background:#f4f1eb;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1eb;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 30px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:40px 48px;text-align:center;">
            <div style="font-size:24px;font-weight:900;letter-spacing:2px;color:#d4af37;text-transform:uppercase;margin-bottom:4px;">Madras Wall Stories</div>
            <div style="font-size:11px;letter-spacing:4px;color:#8899aa;text-transform:uppercase;">Premium Art Prints</div>
          </td>
        </tr>

        <!-- Hero -->
        <tr>
          <td style="padding:40px 48px 24px;text-align:center;background:#fafaf8;border-bottom:1px solid #ede9e0;">
            <div style="font-size:40px;margin-bottom:12px;">${isAdmin ? '🛍️' : '🎉'}</div>
            <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#1a1a2e;">
              ${isAdmin ? 'New Order Received!' : 'Your order is confirmed!'}
            </h1>
            <p style="margin:0;color:#666;font-size:15px;line-height:1.6;">
              ${isAdmin
                ? `A new order has been placed by <strong>${order.customerName}</strong>.`
                : `Thank you, <strong>${order.customerName?.split(' ')[0] || 'there'}</strong>! We're preparing your premium prints.`
              }
            </p>
          </td>
        </tr>

        <!-- Order ID Badge -->
        <tr>
          <td style="padding:20px 48px 0;background:#fafaf8;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#1a1a2e;border-radius:12px;padding:16px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <div style="font-size:11px;letter-spacing:2px;color:#8899aa;text-transform:uppercase;margin-bottom:4px;">Order ID</div>
                        <div style="font-size:22px;font-weight:900;color:#d4af37;letter-spacing:3px;font-family:monospace;">#${orderId}</div>
                      </td>
                      <td align="right">
                        <div style="font-size:11px;letter-spacing:1px;color:#8899aa;text-transform:uppercase;margin-bottom:4px;">Payment</div>
                        <div style="font-size:14px;font-weight:700;color:#4ade80;">${order.paymentMethod === 'COD' ? 'Cash on Delivery' : '✓ Paid via Razorpay'}</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Products -->
        <tr>
          <td style="padding:28px 48px 0;background:#fafaf8;">
            <div style="font-size:12px;font-weight:700;letter-spacing:2px;color:#999;text-transform:uppercase;margin-bottom:16px;">Items Ordered</div>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid #1a1a2e;">
              ${productRows}
            </table>
          </td>
        </tr>

        <!-- Price Summary -->
        <tr>
          <td style="padding:16px 48px 28px;background:#fafaf8;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #ede9e0;padding-top:16px;">
              <tr>
                <td style="font-size:13px;color:#888;padding:4px 0;">Subtotal</td>
                <td style="font-size:13px;color:#555;text-align:right;padding:4px 0;">${formatCurrency(subtotal)}</td>
              </tr>
              <tr>
                <td style="font-size:16px;font-weight:800;color:#1a1a2e;padding:12px 0 0;border-top:2px solid #1a1a2e;">Total Paid</td>
                <td style="font-size:20px;font-weight:900;color:#1a1a2e;text-align:right;padding:12px 0 0;border-top:2px solid #1a1a2e;">${formatCurrency(order.amount)}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Shipping Address -->
        <tr>
          <td style="padding:24px 48px;background:#ffffff;border-top:1px solid #ede9e0;">
            <div style="font-size:12px;font-weight:700;letter-spacing:2px;color:#999;text-transform:uppercase;margin-bottom:12px;">Shipping To</div>
            <div style="font-size:14px;color:#333;line-height:1.8;">
              <strong style="color:#1a1a2e;">${order.customerName}</strong><br/>
              ${formatAddress(order.shippingAddress)}<br/>
              📞 ${order.phone || '—'}<br/>
              ✉️ ${order.email || '—'}
            </div>
          </td>
        </tr>

        <!-- Tracking Notice -->
        ${!isAdmin ? `
        <tr>
          <td style="padding:20px 48px;background:#fffbf0;border-top:1px solid #ede9e0;border-bottom:1px solid #ede9e0;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:20px;vertical-align:top;padding-right:12px;">📦</td>
                <td>
                  <div style="font-size:13px;font-weight:700;color:#1a1a2e;margin-bottom:4px;">What happens next?</div>
                  <div style="font-size:13px;color:#666;line-height:1.6;">Our team is reviewing your order. Tracking updates will arrive once your order ships. We'll keep you posted!</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ` : ''}

        <!-- Footer -->
        <tr>
          <td style="padding:32px 48px;text-align:center;background:#1a1a2e;">
            <div style="font-size:13px;color:#8899aa;line-height:1.8;">
              Thank you for supporting <span style="color:#d4af37;font-weight:700;">Madras Wall Stories</span><br/>
              Questions? Reply to this email or contact us on Instagram.<br/>
              <span style="font-size:11px;color:#556677;margin-top:8px;display:block;">© ${new Date().getFullYear()} Madras Wall Stories. All rights reserved.</span>
            </div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
  `;
}

// ─── Send Order Confirmation ─────────────────────────────────────────────────
export async function sendOrderConfirmationEmail(order) {
  try {
    const transporter = createTransport();
    const orderId = shortOrderId(order);
    const from = process.env.EMAIL_FROM || `Madras Wall Stories <${process.env.EMAIL_USER}>`;

    // Customer email
    await transporter.sendMail({
      from,
      to: order.email,
      subject: `Your Madras Wall Stories order is confirmed 🎉 #${orderId}`,
      html: buildOrderEmailHTML({ order, isAdmin: false }),
    });
    console.log(`[Email] Customer confirmation sent to ${order.email} for order #${orderId}`);

    // Admin alert (optional — only if ADMIN_EMAIL is set)
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await transporter.sendMail({
        from,
        to: adminEmail,
        subject: `🛍️ New Order #${orderId} — ${order.customerName} — ${formatCurrency(order.amount)}`,
        html: buildOrderEmailHTML({ order, isAdmin: true }),
      });
      console.log(`[Email] Admin alert sent to ${adminEmail} for order #${orderId}`);
    }
  } catch (err) {
    // Phase 6: Failure safety — log but NEVER throw, order must still succeed
    console.error('[Email] Failed to send order confirmation email:', err.message);
  }
}
