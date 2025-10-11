import cron from 'node-cron';
import Attendance from '../models/Attendance.js';

// Schedule daily notification for chef at 9:30 AM (except weekends)
export const setupCronJobs = () => {
  cron.schedule('30 9 * * 1-5', async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Count employees marked as 'office' for today
      const count = await Attendance.countDocuments({
        date: { $gte: today, $lt: tomorrow },
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
  });

  console.log('Cron jobs scheduled');
};
