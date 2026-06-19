// src/lib/shiprocket.js

let cachedToken = null;
let tokenExpiry = null;

const getBaseUrl = () => 'https://apiv2.shiprocket.in/v1/external';

/**
 * Handles graceful failure if credentials are not provided.
 */
const checkCredentials = () => {
  if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
    console.warn("[Shiprocket] Missing SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD. API calls will simulate gracefully.");
    return false;
  }
  return true;
};

/**
 * Authenticate and get a Bearer Token
 */
export const authenticate = async (forceRefresh = false) => {
  if (!checkCredentials()) return null;

  if (!forceRefresh && cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const res = await fetch(`${getBaseUrl()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD
      })
    });

    const data = await res.json();

    if (res.ok && data.token) {
      cachedToken = data.token;
      // Token usually expires in 10 days, setting a safe 9-day expiry
      tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000;
      return cachedToken;
    } else {
      console.error("[Shiprocket Auth Error]:", data);
      return null;
    }
  } catch (err) {
    console.error("[Shiprocket Auth Exception]:", err);
    return null;
  }
};

/**
 * Helper function for authenticated API requests with auto-retry
 */
const authenticatedRequest = async (url, options = {}, retries = 1) => {
  let token = await authenticate();
  if (!token) return { success: false, error: 'Shiprocket credentials missing or invalid.' };

  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  try {
    let res = await fetch(url, { ...options, headers });
    
    // If unauthorized, token might have expired abruptly. Force refresh and retry once.
    if (res.status === 401 && retries > 0) {
      token = await authenticate(true);
      headers['Authorization'] = `Bearer ${token}`;
      res = await fetch(url, { ...options, headers });
    }

    const data = await res.json();
    return { success: res.ok, data, status: res.status };
  } catch (err) {
    console.error(`[Shiprocket] Error requesting ${url}:`, err);
    return { success: false, error: err.message };
  }
};

/**
 * Create a new shipment order in Shiprocket
 */
export const createShipment = async (orderData) => {
  if (!checkCredentials()) {
    // Graceful simulate
    return { success: true, shipmentId: `MOCK-SR-${Date.now()}`, orderId: `MOCK-ORD-${Date.now()}` };
  }

  // Format orderData to match Shiprocket API expectations
  // This assumes orderData passed has been mapped appropriately by the caller
  const payload = {
    order_id: orderData.orderId,
    order_date: new Date(orderData.createdAt || Date.now()).toISOString().split('T')[0],
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION_ID || "Primary",
    billing_customer_name: orderData.shippingAddress.firstName || orderData.customerName,
    billing_last_name: orderData.shippingAddress.lastName || "",
    billing_address: orderData.shippingAddress.address1 || orderData.shippingAddress.street,
    billing_address_2: orderData.shippingAddress.address2 || orderData.shippingAddress.areaOrLocality || "",
    billing_city: orderData.shippingAddress.city,
    billing_pincode: orderData.shippingAddress.pincode,
    billing_state: orderData.shippingAddress.state,
    billing_country: orderData.shippingAddress.country || "India",
    billing_email: orderData.email,
    billing_phone: orderData.phone,
    shipping_is_billing: true,
    order_items: orderData.products.map(p => ({
      name: p.title,
      sku: p.productId?.toString() || "CUSTOM",
      units: p.quantity,
      selling_price: p.price,
      discount: 0,
      tax: 0,
      hsn: 4911
    })),
    payment_method: orderData.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
    sub_total: orderData.amount,
    length: 30, // generic poster tube dimensions
    breadth: 10,
    height: 10,
    weight: 0.5 // 500g
  };

  const response = await authenticatedRequest(`${getBaseUrl()}/orders/create/adhoc`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  if (response.success && response.data.shipment_id) {
    return {
      success: true,
      shipmentId: response.data.shipment_id,
      orderId: response.data.order_id,
      awbCode: response.data.awb_code // Sometimes returned synchronously
    };
  }

  return { success: false, error: response.data?.message || 'Failed to create shipment.' };
};

/**
 * Generate AWB for an existing shipment
 */
export const generateAWB = async (shipmentId) => {
  if (!checkCredentials()) {
    return { success: true, awbCode: `MOCK-AWB-${Date.now()}`, courierName: 'Mock Courier', courierId: '1' };
  }

  const response = await authenticatedRequest(`${getBaseUrl()}/courier/assign/awb`, {
    method: 'POST',
    body: JSON.stringify({ shipment_id: shipmentId })
  });

  if (response.success && response.data.response?.data?.awb_code) {
    return {
      success: true,
      awbCode: response.data.response.data.awb_code,
      courierName: response.data.response.data.courier_name,
      courierId: response.data.response.data.courier_company_id
    };
  }

  return { success: false, error: response.data?.message || 'Failed to generate AWB.' };
};

/**
 * Request courier pickup
 */
export const requestPickup = async (shipmentId) => {
  if (!checkCredentials()) {
    return { success: true, message: 'Pickup mocked successfully.' };
  }

  const response = await authenticatedRequest(`${getBaseUrl()}/courier/generate/pickup`, {
    method: 'POST',
    body: JSON.stringify({ shipment_id: [shipmentId] })
  });

  if (response.success) {
    return { success: true, message: response.data?.pickup_status || 'Pickup requested.' };
  }

  return { success: false, error: response.data?.message || 'Failed to request pickup.' };
};

/**
 * Fetch PDF Label URL
 */
export const fetchLabel = async (shipmentId) => {
  if (!checkCredentials()) {
    return { success: true, labelUrl: 'https://example.com/mock-label.pdf' };
  }

  const response = await authenticatedRequest(`${getBaseUrl()}/courier/generate/label`, {
    method: 'POST',
    body: JSON.stringify({ shipment_id: [shipmentId] })
  });

  if (response.success && response.data.label_created) {
    return { success: true, labelUrl: response.data.label_url };
  }

  return { success: false, error: 'Failed to fetch label.' };
};

/**
 * Get tracking status for an AWB
 */
export const refreshTracking = async (awbCode) => {
  if (!checkCredentials()) {
    return { success: true, status: 'Shipped', estimatedDelivery: new Date(Date.now() + 3*24*60*60*1000) };
  }

  const response = await authenticatedRequest(`${getBaseUrl()}/courier/track/awb/${awbCode}`, {
    method: 'GET'
  });

  if (response.success && response.data.tracking_data) {
    const tracking = response.data.tracking_data;
    return {
      success: true,
      status: tracking.shipment_status === 7 ? 'Delivered' : 
              tracking.shipment_status === 6 ? 'Shipped' :
              tracking.shipment_status === 17 ? 'Out For Delivery' :
              tracking.shipment_status === 11 ? 'Pending' : 'Shipped', // Mapping logic
      estimatedDelivery: tracking.etd ? new Date(tracking.etd) : null,
      courierName: tracking.courier_name,
      trackingUrl: tracking.track_url
    };
  }

  return { success: false, error: 'Failed to fetch tracking.' };
};

/**
 * Cancel a shipment/order in Shiprocket
 */
export const cancelShipment = async ({ awbCode, shipmentId }) => {
  if (!checkCredentials()) {
    return { success: true, message: 'Cancellation mocked successfully.' };
  }

  // If we have an AWB, cancel via AWB endpoint
  if (awbCode) {
    const response = await authenticatedRequest(`${getBaseUrl()}/orders/cancel/awbs`, {
      method: 'POST',
      body: JSON.stringify({ awbs: [awbCode] })
    });

    if (response.success && response.data?.message) {
      return { success: true, message: response.data.message };
    }
    return { success: false, error: response.data?.message || 'Failed to cancel AWB in Shiprocket.' };
  }

  // If we only have shipmentId, try cancelling via order IDs (Shiprocket expects its own order_ids, 
  // but if we only have shipmentId and no awb, we might try if shipmentId works or return error)
  // To be safe, if we only have shipmentId, we will attempt the cancel endpoint, but it might fail 
  // if Shiprocket strict checks order_id vs shipment_id.
  if (shipmentId) {
    const response = await authenticatedRequest(`${getBaseUrl()}/orders/cancel`, {
      method: 'POST',
      body: JSON.stringify({ ids: [shipmentId] })
    });

    if (response.success && response.data?.message) {
      return { success: true, message: response.data.message };
    }
    return { success: false, error: response.data?.message || 'Failed to cancel shipment in Shiprocket.' };
  }

  return { success: false, error: 'No AWB or Shipment ID provided for cancellation.' };
};
