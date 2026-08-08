/**
 * Utility for structured logging across the application.
 * Allows easy parsing in log management systems.
 * 
 * @param {string} category - e.g. 'PAYMENT', 'WEBHOOK', 'ORDER', 'RATE LIMIT'
 * @param {object} data - The payload to log
 */
export function logStructured(category, data) {
  const timestamp = new Date().toISOString();
  
  // Format as a clear, parseable JSON string
  const logEntry = JSON.stringify({
    timestamp,
    category: `[${category}]`,
    ...data
  });

  // Decide log level based on category or specific flags (could be extended)
  if (data.error || data.status === 'failed') {
    console.error(logEntry);
  } else {
    console.log(logEntry);
  }
}

