const fs = require('fs');
const filePath = './frontend/src/lib/sms.js';
let content = fs.readFileSync(filePath, 'utf8');

const trackingSmsFunc = `
export async function sendTrackingSMS(order, status) {
  try {
    const phone = order.phone;
    if (!phone || phone === '0000000000') {
      return;
    }

    const orderId = shortOrderId(order);
    let message = '';

    if (status === 'Shipped') {
      message = \`Great news! Your Madras Wall Stories order #\${orderId} has been shipped via \${order.courierName || 'our partner'}. Track it using AWB: \${order.trackingId || 'soon'}\`;
    } else if (status === 'Out For Delivery') {
      message = \`Your Madras Wall Stories order #\${orderId} is out for delivery and will reach you today! 🎉\`;
    } else if (status === 'Delivered') {
      message = \`Your Madras Wall Stories order #\${orderId} has been delivered! We hope you love your premium prints. 🎨\`;
    } else {
      return; // Do not send SMS for other statuses to avoid spam
    }

    const provider = (process.env.SMS_PROVIDER || 'fast2sms').toLowerCase();

    if (provider === 'twilio') {
      await sendViaTwilio({ phone, message });
    } else if (provider === 'msg91') {
      await sendViaMSG91({ phone, message });
    } else {
      // Default: Fast2SMS
      await sendVisFast2SMS({ phone, message });
    }

    console.log(\`[SMS] Tracking SMS (\${status}) sent to \${phone} for order #\${orderId}\`);
  } catch (err) {
    // Failure safety — log but NEVER throw
    console.error('[SMS] Failed to send tracking SMS:', err.message);
  }
}
`;

if (!content.includes('sendTrackingSMS')) {
  content += '\n' + trackingSmsFunc;
  fs.writeFileSync(filePath, content);
  console.log('Patched sms.js successfully');
}
