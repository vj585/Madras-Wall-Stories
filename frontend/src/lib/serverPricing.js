import Product from '@/models/Product';
import CustomPricing from '@/models/CustomPricing';
import StoreSettings from '@/models/StoreSettings';

export async function calculateSecureOrderTotal(cartItems) {
  let subtotal = 0;
  const recalculatedProducts = [];

  // Fetch configs once
  const customPricingConfig = await CustomPricing.findOne().lean();
  const storeSettings = await StoreSettings.findOne({ singletonId: 'global_settings' }).lean();
  const framePricing = storeSettings?.framePricing || [];

  for (const item of cartItems) {
    let unitPrice = 0;

    if (item.isCustom) {
      // Rebuild custom print price
      // Parse productType from name: "Custom Poster" -> "Poster"
      const productType = item.name.replace('Custom ', '').trim();
      
      let basePrice = customPricingConfig?.basePrices?.[productType] || 0;
      
      if (item.size && customPricingConfig?.sizes?.[item.size]) {
        basePrice += customPricingConfig.sizes[item.size];
      }
      
      if (productType === 'Poster' && item.frame && customPricingConfig?.frames?.[item.frame]) {
        basePrice += customPricingConfig.frames[item.frame];
      }
      
      if (item.customDetails?.finish && customPricingConfig?.finishes?.[item.customDetails.finish]) {
        basePrice += customPricingConfig.finishes[item.customDetails.finish];
      }
      
      unitPrice = basePrice;
    } else if (item.productId) {
      // Rebuild standard product price
      const product = await Product.findById(item.productId).lean();
      if (!product) throw new Error(`Product not found: ${item.title}`);
      
      if (product.variants && product.variants.length > 0) {
        const variant = product.variants.find(v => v.size === item.size) || product.variants[0];
        unitPrice = variant.salePrice || variant.price || 0;
      } else {
        unitPrice = product.salePrice || product.price || 0;
      }
      
      if (item.frame) {
        const frameConfig = framePricing.find(f => f.name === item.frame);
        if (frameConfig && frameConfig.markup) {
          unitPrice += frameConfig.markup;
        }
      }
    } else {
      throw new Error(`Invalid cart item structure: ${item.title}`);
    }

    const lineTotal = unitPrice * (item.quantity || 1);
    subtotal += lineTotal;

    // Push the cryptographically rebuilt item to replace the frontend payload
    recalculatedProducts.push({
      productId: item.productId,
      title: item.title || item.name,
      price: unitPrice, // Legacy
      unitPrice: unitPrice,
      lineTotal: lineTotal,
      quantity: item.quantity || 1,
      size: item.size,
      frame: item.frame,
      image: item.image,
      isCustom: item.isCustom,
      customDetails: item.customDetails
    });
  }

  return { subtotal, recalculatedProducts };
}
