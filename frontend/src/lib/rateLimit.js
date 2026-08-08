import { connectDB } from '@/lib/mongodb';
import RateLimit from '@/models/RateLimit';
import { logStructured } from '@/lib/logger';

/**
 * Validates if the given IP has exceeded the maxRequests for a specific endpoint.
 * 
 * @param {string} ip - The IP address of the client
 * @param {string} endpoint - The endpoint identifier (e.g. 'checkout', 'register')
 * @param {number} maxRequests - Max allowed requests within the window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Promise<boolean>} true if allowed, false if rate limited
 */
export async function checkRateLimit(ip, endpoint, maxRequests, windowMs) {
  try {
    await connectDB();
    const now = new Date();
    
    // Find existing rate limit record for this IP & endpoint
    const record = await RateLimit.findOne({ ip, endpoint });

    if (!record) {
      // First request in the window
      await RateLimit.create({
        ip,
        endpoint,
        count: 1,
        expiresAt: new Date(now.getTime() + windowMs)
      });
      return true;
    }

    if (record.count >= maxRequests) {
      logStructured('RATE LIMIT', {
        endpoint,
        ip,
        blockedAt: now.toISOString(),
        limit: maxRequests
      });
      return false; // Rate limit exceeded
    }

    // Increment count
    await RateLimit.updateOne(
      { _id: record._id },
      { $inc: { count: 1 } }
    );

    return true;

  } catch (error) {
    console.error('[RateLimit] Error checking rate limit:', error);
    // If rate limiter fails (e.g. DB issue), fail open so users aren't blocked from buying
    return true; 
  }
}

/**
 * Extracts the client IP address securely from the Next.js request object.
 */
export function getClientIp(req) {
  let ip = req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for');
  if (ip) {
    ip = ip.split(',')[0].trim();
  }
  return ip || '127.0.0.1';
}

