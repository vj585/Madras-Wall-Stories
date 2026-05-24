// src/lib/shiprocket.js

/**
 * Shiprocket API Integration (Mocked for now)
 * Will be replaced with real API calls using SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD.
 */

export const createShipment = async (orderDetails) => {
  console.log("Mock: Creating Shiprocket shipment for", orderDetails.orderId);
  return {
    success: true,
    shipmentId: `SR-${Math.floor(Math.random() * 1000000)}`,
    status: 'Pending'
  };
};

export const generateAWB = async (shipmentId) => {
  console.log("Mock: Generating AWB for shipment", shipmentId);
  return {
    success: true,
    awbCode: `AWB${Math.floor(Math.random() * 100000000)}`,
    courierName: 'Delhivery', // Mocked courier
  };
};

export const getTracking = async (awbCode) => {
  console.log("Mock: Fetching tracking for AWB", awbCode);
  return {
    success: true,
    status: 'Shipped',
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
  };
};

export const refreshShipmentStatus = async (shipmentId) => {
  console.log("Mock: Refreshing status for shipment", shipmentId);
  return {
    success: true,
    status: 'Shipped', // Mocked updated status
  };
};
