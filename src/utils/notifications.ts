import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export interface NotificationScheduleConfig {
  enabled: boolean;
}

export const DEFAULT_REMINDER_TIMES = [
  { id: 801, hour: 8, minute: 0, title: '☀️ Morning Duty Check-in', body: 'Attendance Pro: Subah ki duty & shift attendance mark karein!' },
  { id: 802, hour: 12, minute: 0, title: '🍱 Mid-Day Shift Update', body: 'Dopehar check: Duty status aur lunch time log karein.' },
  { id: 803, hour: 15, minute: 0, title: '⏰ Afternoon Attendance Log', body: 'Attendance Pro: Afternoon shift check-in & duty status!' },
  { id: 804, hour: 17, minute: 0, title: '🌆 Evening Overtime & Out-Time', body: 'Duty khatam: Extra overtime hours aur out-time mark karein.' },
  { id: 805, hour: 20, minute: 0, title: '🌙 Night Duty & Salary Ledger', body: 'Aaj ka hisaab: Daily duty, overtime & khata entry final karein!' },
];

/**
 * Schedule 5 Daily Recurring Local Notifications (8 AM, 12 PM, 3 PM, 5 PM, 8 PM)
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

      // 3. Schedule 5 daily recurring alarms
      const notificationsToSchedule = DEFAULT_REMINDER_TIMES.map((item) => ({
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

      console.log('Successfully scheduled 5 daily local reminders!');
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
    console.error('Failed to schedule daily reminders:', err);
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
            title: '🔔 Reminder Working!',
            body: 'Attendance Notebook Pro daily reminders (8 AM, 12 PM, 3 PM, 5 PM, 8 PM) are active!',
            schedule: { at: new Date(Date.now() + 1000) },
            actionTypeId: 'OPEN_APP',
          },
        ],
      });
      return true;
    } else if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('🔔 Reminder Working!', {
          body: 'Attendance Notebook Pro daily reminders (8 AM, 12 PM, 3 PM, 5 PM, 8 PM) are active!',
        });
        return true;
      } else {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          new Notification('🔔 Reminder Working!', {
            body: 'Attendance Notebook Pro daily reminders (8 AM, 12 PM, 3 PM, 5 PM, 8 PM) are active!',
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
