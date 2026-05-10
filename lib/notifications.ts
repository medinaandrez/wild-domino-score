import * as Notifications from "expo-notifications";
import { loadSettings } from "./settings";

const REMINDER_ID = "game-reminder";
const REMINDER_SECONDS = 2 * 60 * 60; // 2 hours

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleGameReminder(): Promise<void> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") return;

    await cancelGameReminder();

    const settings = await loadSettings();
    const isEs = settings.language === "es";

    await Notifications.scheduleNotificationAsync({
      identifier: REMINDER_ID,
      content: {
        title: isEs ? "Partida en curso 🎲" : "Game in progress 🎲",
        body: isEs
          ? "¡No olvides continuar tu partida de Spinner!"
          : "Don't forget to continue your Spinner game!",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: REMINDER_SECONDS,
      },
    });
  } catch {
    // Notifications not available on this device — ignore silently
  }
}

export async function cancelGameReminder(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);
  } catch {
    // ignore
  }
}
