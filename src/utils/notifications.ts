import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export interface NotificationScheduleConfig {
  enabled: boolean;
}

export const HOURLY_REMINDER_TIMES = [
  { id: 901, hour: 8, minute: 0, title: '☀️ Subah Ki Shuruat', body: 'Good morning! Aaj duty par jaana hai kya?' },
  { id: 902, hour: 9, minute: 0, title: '💼 Duty Check-in', body: 'Aaj ki attendance mark kar di kya?' },
  { id: 903, hour: 10, minute: 0, title: '⏱️ Morning Update', body: 'Subah ka kaam kaisa chal raha hai?' },
  { id: 904, hour: 11, minute: 0, title: '💧 Health Reminder', body: 'Thoda paani pi lo aur relax karo!' },
  { id: 905, hour: 12, minute: 0, title: '🍱 Lunch Time', body: 'Khana kha liya kya? Thoda aaram karo.' },
  { id: 906, hour: 13, minute: 0, title: '📊 Afternoon Shift', body: 'Dopehar ka hisaab app me note kar lo.' },
  { id: 907, hour: 14, minute: 0, title: '💼 Work Status', body: 'Aaj half-day hai ya full duty?' },
  { id: 908, hour: 15, minute: 0, title: '☕ Tea Break', body: 'Chai pi li? Thoda break le lo.' },
  { id: 909, hour: 16, minute: 0, title: '⏰ Evening Approaching', body: 'Aaj overtime kitne ghante kiya?' },
  { id: 910, hour: 17, minute: 0, title: '🌆 Shift Closing', body: 'Duty khatam hone wali hai, out-time check karo.' },
  { id: 911, hour: 18, minute: 0, title: '🚶‍♂️ Ghar Wapsi', body: 'Safe journey! Ghar pahunch kar attendance check karein.' },
  { id: 912, hour: 19, minute: 0, title: '🍽️ Evening Time', body: 'Shaam ka nashta ho gaya kya?' },
  { id: 913, hour: 20, minute: 0, title: '🌙 Daily Summary', body: 'Aaj ka din kaisa raha? Attendance note kar lo.' },
  { id: 914, hour: 21, minute: 0, title: '🛌 Good Night', body: 'Sone se pehle aaj ki salary aur hisaab check kar lo!' },
];

export const DEFAULT_REMINDER_TIMES = HOURLY_REMINDER_TIMES;

/**
 * Schedule Hourly Recurring Local Notifications (8 AM to 9 PM every hour)
 */
export async function scheduleDailyReminders(): Promise<boolean> {
  try {
    if (Capacitor.isNativePlatform()) {
      // 1. Check & Request Permissions
      const permResult = await LocalNotifications.checkPermissions();
      if (permResult.display !== 'granted') {
        const reqResult = await LocalNotifications.requestPermissions();
        if (reqResult.display !== 'granted') {
          console.warn('Local Notifications permission denied');
          return false;
        }
      }

      // 2. Cancel existing reminders
      await cancelAllReminders();

      // 3. Schedule hourly recurring alarms
      const notificationsToSchedule = HOURLY_REMINDER_TIMES.map((item) => ({
        id: item.id,
        title: item.title,
        body: item.body,
        schedule: {
          on: {
            hour: item.hour,
            minute: item.minute,
          },
          repeats: true,
          allowWhileIdle: true,
        },
        sound: 'res://platform_default',
        smallIcon: 'ic_stat_name',
        actionTypeId: 'OPEN_APP',
      }));

      await LocalNotifications.schedule({
        notifications: notificationsToSchedule as unknown as ScheduleOptions['notifications'],
      });

      console.log('Successfully scheduled hourly local reminders (8 AM to 9 PM)!');
      return true;
    } else {
      // Web Browser environment
      if ('Notification' in window) {
        if (Notification.permission !== 'granted') {
          await Notification.requestPermission();
        }
      }
      return true;
    }
  } catch (err) {
    console.error('Failed to schedule hourly reminders:', err);
    return false;
  }
}

/**
 * Cancel all scheduled reminders
 */
export async function cancelAllReminders(): Promise<void> {
  try {
    if (Capacitor.isNativePlatform()) {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({
          notifications: pending.notifications.map((n) => ({ id: n.id })),
        });
      }
    }
  } catch (err) {
    console.error('Failed to cancel reminders:', err);
  }
}

/**
 * Trigger an instant test notification
 */
export async function triggerTestNotification(): Promise<boolean> {
  try {
    if (Capacitor.isNativePlatform()) {
      const permResult = await LocalNotifications.checkPermissions();
      if (permResult.display !== 'granted') {
        await LocalNotifications.requestPermissions();
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            id: 999,
            title: '🔔 Test Notification Working!',
            body: 'Attendance Notebook Pro hourly reminders (8 AM to 9 PM) are active!',
            schedule: { at: new Date(Date.now() + 1000) },
            actionTypeId: 'OPEN_APP',
          },
        ],
      });
      return true;
    } else if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('🔔 Test Notification Working!', {
          body: 'Attendance Notebook Pro hourly reminders (8 AM to 9 PM) are active!',
        });
        return true;
      } else {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          new Notification('🔔 Test Notification Working!', {
            body: 'Attendance Notebook Pro hourly reminders (8 AM to 9 PM) are active!',
          });
          return true;
        }
      }
    }
  } catch (err) {
    console.error('Test notification failed:', err);
  }
  return false;
}
