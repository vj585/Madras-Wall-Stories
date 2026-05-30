const fs = require('fs');
const filePath = './frontend/src/lib/email.js';
let content = fs.readFileSync(filePath, 'utf8');

const htmlFunc = `
function buildTrackingEmailHTML({ order, status }) {
  const orderId = shortOrderId(order);
  let statusIcon = '📦';
  let message = '';
  
  if (status === 'Shipped') {
    statusIcon = '🚚';
    message = 'Great news! Your order has been shipped and is on its way to you.';
  } else if (status === 'Out For Delivery') {
    statusIcon = '🛵';
    message = 'Your order is out for delivery and will reach you today!';
  } else if (status === 'Delivered') {
    statusIcon = '🎉';
    message = 'Your order has been delivered! We hope you love your premium prints.';
  } else {
    message = \`Your order status has been updated to: \${status}\`;
  }

  return \`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Order Update: \${status}</title>
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
            <div style="font-size:40px;margin-bottom:12px;">\${statusIcon}</div>
            <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#1a1a2e;">
              Order \${status}
            </h1>
            <p style="margin:0;color:#666;font-size:15px;line-height:1.6;">
              \${message}
            </p>
          </td>
        </tr>

        <!-- Tracking Info -->
        <tr>
          <td style="padding:32px 48px;background:#ffffff;border-top:1px solid #ede9e0;">
            <div style="font-size:12px;font-weight:700;letter-spacing:2px;color:#999;text-transform:uppercase;margin-bottom:12px;">Delivery Details</div>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border-radius:12px;padding:20px;">
              <tr>
                <td style="font-size:14px;color:#555;padding-bottom:12px;">Order ID</td>
                <td style="font-size:14px;font-weight:700;color:#1a1a2e;text-align:right;padding-bottom:12px;">#\${orderId}</td>
              </tr>
              \${order.trackingId ? \`
              <tr>
                <td style="font-size:14px;color:#555;padding-bottom:12px;border-top:1px solid #eee;padding-top:12px;">Courier</td>
                <td style="font-size:14px;font-weight:700;color:#1a1a2e;text-align:right;padding-bottom:12px;border-top:1px solid #eee;padding-top:12px;">\${order.courierName || 'Partner'}</td>
              </tr>
              <tr>
                <td style="font-size:14px;color:#555;border-top:1px solid #eee;padding-top:12px;">AWB / Tracking</td>
                <td style="font-size:14px;font-weight:700;color:#3b82f6;text-align:right;border-top:1px solid #eee;padding-top:12px;">\${order.trackingId}</td>
              </tr>\` : ''}
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:32px 48px;text-align:center;background:#1a1a2e;">
            <div style="font-size:13px;color:#8899aa;line-height:1.8;">
              Track your complete order timeline in your account.<br/>
              <span style="font-size:11px;color:#556677;margin-top:8px;display:block;">© \${new Date().getFullYear()} Madras Wall Stories. All rights reserved.</span>
            </div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
  \`;
}

export async function sendTrackingEmail(order, status) {
  try {
    const transporter = createTransport();
    const from = process.env.EMAIL_FROM || \`Madras Wall Stories <\${process.env.EMAIL_USER}>\`;
    const orderId = shortOrderId(order);

    await transporter.sendMail({
      from,
      to: order.email,
      subject: \`Update on your Madras Wall Stories Order: \${status} 📦\`,
      html: buildTrackingEmailHTML({ order, status }),
    });
    console.log(\`[Email] Tracking email (\${status}) sent to \${order.email} for order #\${orderId}\`);
  } catch (err) {
    console.error('[Email] Failed to send tracking email:', err.message);
  }
}
`;

if (!content.includes('sendTrackingEmail')) {
  content += '\n' + htmlFunc;
  fs.writeFileSync(filePath, content);
  console.log('Patched email.js successfully');
}
