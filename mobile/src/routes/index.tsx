import { useEffect, useState } from "react";

import { useTheme, Box } from "native-base";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";

import { useAuth } from "@hooks/useAuth";

import { AuthRoutes } from "./auth.routes";
import { AppRoutes } from "./app.routes";
import { Notification } from "@components/Notification";
import { Loading } from "@components/Loading";
import {
  NotificationWillDisplayEvent,
  OSNotification,
  OneSignal,
} from "react-native-onesignal";

const linking = {
  prefixes: ["com.icapr.ignitegym://", "ignite-gym://"],
  config: {
    screens: {
      signIn: {
        path: "/signIn",
      },
      signUp: {
        path: "/signUp",
      },
      exercise: {
        path: "/exercise/:exerciseId",
      },
      history: {
        path: "/history",
      },
      profile: {
        path: "/profile",
      },
      NotFound: "*",
    },
  },
};

export function Routes() {
  const { colors } = useTheme();

  const [notification, setNotification] = useState<OSNotification>();

  const { user, isLoadingUserStorageData } = useAuth();

  const theme = DefaultTheme;

  theme.colors.background = colors.gray[700];

  useEffect(() => {
    const handleNotificarion = (event: NotificationWillDisplayEvent): void => {
      event.preventDefault();
      const response = event.getNotification();
      setNotification(response);
    };
    OneSignal.Notifications.addEventListener(
      "foregroundWillDisplay",
      handleNotificarion
    );
    return () =>
      OneSignal.Notifications.removeEventListener(
        "foregroundWillDisplay",
        handleNotificarion
      );
  }, []);

  if (isLoadingUserStorageData) {
    return <Loading />;
  }

  return (
    <Box flex={1} bg="gray.700">
      <NavigationContainer theme={theme} linking={linking}>
        {user.id ? <AppRoutes /> : <AuthRoutes />}
        {notification && (
          <Notification
            data={notification}
            onClose={() => {
              setNotification(undefined);
            }}
          />
        )}
      </NavigationContainer>
    </Box>
  );
}
