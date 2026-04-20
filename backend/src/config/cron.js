import cron from 'node-cron';
import Attendance from '../models/Attendance.js';
import { getUtcDayRangeForIstDate } from '../utils/date.js';

// Schedule daily notification for chef at 9:30 AM (except weekends)
export const setupCronJobs = () => {
  cron.schedule('30 9 * * 1-5', async () => {
    try {
      const { start, end } = getUtcDayRangeForIstDate();

      // Count employees marked as 'office' for today
      const count = await Attendance.countDocuments({
        date: { $gte: start, $lt: end },
        status: 'office'
      });
      
      console.log(`[${new Date().toISOString()}] Chef notification: ${count} employees in office today`);

      // In a real application, you would send an email or push notification to the chef
      // For example:
      // await sendEmailToChef(count);
      // or
      // await sendPushNotification('chef', { count });
    } catch (error) {
      console.error('Chef notification error:', error);
    }
  }, {
    timezone: 'Asia/Kolkata'
  });

  console.log('Cron jobs scheduled');
};
