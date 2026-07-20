import { Platform } from "react-native";
import { supabase } from "./supabase";

function loadNotifications() {
  try {
    return require("expo-" + "notifications");
  } catch {
    return null;
  }
}

function loadDevice() {
  try {
    return require("expo-" + "device");
  } catch {
    return null;
  }
}

export async function registerForPushNotificationsAsync(userId: string) {
  const Device = loadDevice();
  const Notifications = loadNotifications();

  if (!Device || !Notifications) {
    return null;
  }

  if (!Device.isDevice) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  const token = tokenData.data;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Notificações",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  const { error } = await supabase.from("push_tokens").upsert(
    {
      user_id: userId,
      token,
      platform: Platform.OS,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.warn("[Push] Erro ao salvar token:", error.message);
  }

  return token;
}

export function setupNotificationHandler() {
  const Notifications = loadNotifications();
  if (!Notifications) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}
