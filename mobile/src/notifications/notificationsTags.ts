import { OneSignal } from "react-native-onesignal";

export function tagUserDate(itemCount: string) {
  const currentDate = new Date();

  if (currentDate.getDay() === 6) {
    OneSignal.User.addTag("weekend", itemCount);
  }
}
