import Order from '@/models/Order';
import Product from '@/models/Product';
import cloudinary from '@/lib/cloudinary';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { sendOrderSMS } from '@/lib/sms';

export async function processAndSaveOrder(orderData) {
  // 1. Process custom images to Cloudinary
  if (orderData.products && Array.isArray(orderData.products)) {
    for (let i = 0; i < orderData.products.length; i++) {
      const item = orderData.products[i];
      if (item.image && item.image.startsWith('data:image/')) {
        console.log('Uploading custom image to Cloudinary for item:', item.title);
        const uploadResponse = await cloudinary.uploader.upload(item.image, {
          folder: 'custom_prints',
        });
        orderData.products[i].image = uploadResponse.secure_url;
        orderData.products[i].isCustom = true;
        console.log('Cloudinary upload complete:', uploadResponse.secure_url);
      }
    }
  }

  // 2. Create the order
  console.log('Creating order in MongoDB with data:', { customerName: orderData.customerName, email: orderData.email, amount: orderData.amount, paymentMethod: orderData.paymentMethod });
  const newOrder = await Order.create(orderData);
  console.log('Order created successfully in MongoDB. Order ID:', newOrder._id.toString());

  // 3. Decrement stock for non-custom products
  if (newOrder.products && Array.isArray(newOrder.products)) {
    for (const item of newOrder.products) {
      if (item.productId && !item.isCustom) {
        console.log(`Decrementing stock for product ID: ${item.productId} by ${item.quantity}`);
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.quantity } },
          { new: true }
        );
        console.log('Stock updated successfully for product:', item.productId);
      }
    }
  }

  // 4. Fire email + SMS (failure-safe — never blocks order response)
  const plainOrder = newOrder.toObject ? newOrder.toObject() : newOrder;
  // Run in background — do not await, order response returns immediately
  Promise.all([
    sendOrderConfirmationEmail(plainOrder),
    sendOrderSMS(plainOrder),
  ]).catch(err => console.error('[Notifications] Unexpected error in notification dispatch:', err));

  return newOrder;
}
