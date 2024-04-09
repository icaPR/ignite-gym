import { StatusBar } from "react-native";
import { NativeBaseProvider } from "native-base";
import {
  useFonts,
  Roboto_400Regular,
  Roboto_700Bold,
} from "@expo-google-fonts/roboto";

import { Routes } from "@routes/index";

import { AuthContextProvider } from "@contexts/AuthContext";

import { THEME } from "./src/theme";

import { Loading } from "@components/Loading";

import { NotificationClickEvent, OneSignal } from "react-native-onesignal";

import { OneSignal_Keys } from "@env";

import { tagUserDate } from "./src/notifications/notificationsTags";
import { useEffect, useState } from "react";
import { api } from "@services/api";
import { HistoryByDayDTO } from "@dtos/HistoryByDayDTO";

OneSignal.initialize(OneSignal_Keys);
OneSignal.Notifications.requestPermission(true);

export default function App() {
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_700Bold });

  async function getLastExercises() {
    try {
      const currentDate = new Date();
      const sevenDaysAgo = new Date();

      if (currentDate.getDay() !== 1) {
        return undefined;
      }

      sevenDaysAgo.setDate(currentDate.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const response = await api.get(`/history`);

      let total = 0;
      response.data.forEach((obj: HistoryByDayDTO) => {
        obj.data.forEach((item) => {
          const updatedAtDate = new Date(item.created_at.replace(" ", "T"));
          if (updatedAtDate > sevenDaysAgo) {
            total++;
          }
        });
      });
      return total;
    } catch (error) {
      console.error("Erro:", error);
    }
  }

  useEffect(() => {
    const itemCount = getLastExercises();
    if (itemCount !== undefined) {
      tagUserDate(itemCount.toString());
    }
  }, []);

  useEffect(() => {
    const handleNotificationClick = (event: NotificationClickEvent): void => {};

    OneSignal.Notifications.addEventListener("click", handleNotificationClick);

    return () =>
      OneSignal.Notifications.removeEventListener(
        "click",
        handleNotificationClick
      );
  }, []);

  return (
    <NativeBaseProvider theme={THEME}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <AuthContextProvider>
        {fontsLoaded ? <Routes /> : <Loading />}
      </AuthContextProvider>
    </NativeBaseProvider>
  );
}
