// src/lib/porter.js

/**
 * Porter API Integration (Mocked for now)
 * Will be replaced with real API calls using PORTER_API_KEY.
 */

// Helper to calculate approximate distance in km between two lat/lng points using Haversine formula
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export const calculateDelivery = async (pickupCoords, dropCoords) => {
  console.log("Mock: Calculating Porter delivery cost");
  try {
    // Basic mock calculation based on straight-line distance
    // In production, this would call Porter API /v1/get_quote
    
    // For demo purposes, if no coordinates, assume it's ~5km
    let distanceKm = 5;
    
    if (pickupCoords && dropCoords && pickupCoords.latitude && dropCoords.latitude) {
        distanceKm = getDistanceFromLatLonInKm(
            pickupCoords.latitude, pickupCoords.longitude,
            dropCoords.latitude, dropCoords.longitude
        );
    }
    
    // Base rate ₹40 + ₹15 per km
    const actualCost = Math.round(40 + (distanceKm * 15));
    
    return {
      success: true,
      actualCost: actualCost,
      distanceKm: distanceKm.toFixed(1)
    };
  } catch (error) {
    console.error("Porter calculation error:", error);
    return { success: false, error: "Failed to calculate delivery cost" };
  }
};

export const bookPorterTask = async (orderDetails, pickupCoords, dropCoords) => {
  console.log("Mock: Booking Porter task for", orderDetails.orderId);
  return {
    success: true,
    taskId: `PRT-${Math.floor(Math.random() * 1000000)}`,
    status: 'Ready For Pickup',
    trackingUrl: `https://porter.in/track/PRT-${Math.floor(Math.random() * 1000000)}`
  };
};

export const refreshDeliveryStatus = async (taskId) => {
  console.log("Mock: Refreshing Porter status for", taskId);
  return {
    success: true,
    status: 'Out For Delivery'
  };
};

