// lib/cron.js
import { CronJob } from 'cron';


//   Initializes and starts a cron job that pings the /health endpoint every 12 minutes.
//  @param {string} serverUrl - The base URL of your application (e.g., http://localhost:5000)
//instead of this we are using FRONTEND_URL from env directly.
 
export const initHealthCheckCron = (serverUrl) => {
  // Cron pattern: '*/12 * * * *' means "Run every 12 minutes"
  // Fields: Minute (0-59) | Hour (0-23) | Day of Month (1-31) | Month (1-12) | Day of Week (0-6)
  const job = new CronJob('*/12 * * * *', async () => {
    try {
      const targetUrl = `${serverUrl}/health`;
      const response = await fetch(targetUrl);
      
      if (response.ok) {
        console.log(`Cron jobs logs start`);
        console.log(`[Cron] Health check ping successful: ${targetUrl} at ${new Date().toISOString()}`);
        console.log(`[Cron] Response status: ${response.status}`);
        console.log(`[Cron] Response body: ${ response.message }`);
        console.log(`[Cron] Response timestamp: ${ response.timestamp }`);
        console.log(`[Cron] Response body: ${ response.environment }`);
        console.log(`Cron jobs logs end`);
      } else {
        console.warn(`[Cron] Health check responded with status ${response.status} at ${new Date().toISOString()}`);
      }
    } catch (error) {
      console.error(`[Cron] Health check request failed at ${new Date().toISOString()}:`, error.message);
    }
  });

  // Start the job immediately
  job.start();
  console.log('[Cron] Health check cron job initialized (runs every 14 minutes).');
  
  return job;
};