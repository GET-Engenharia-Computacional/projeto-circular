import { Button, View } from "react-native";
import * as Location from "expo-location";

import * as TaskManager from "expo-task-manager";

let webSocket: WebSocket;

TaskManager.defineTask<{ locations: Location.LocationObject[] }>(
  "background-location-task",
  async ({ data, error }) => {
    if (error) {
      console.error(error.message);
      return;
    }

    if (data) {
      const { locations } = data;

      webSocket.send(JSON.stringify(locations));
      console.log(locations);
    }
  },
);

const Index = () => {
  const requestPermissions = async () => {
    const { status: foregroundStatus } =
      await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus === "granted") {
      const { status: backgroundStatus } =
        await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus === "granted") {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL;
        webSocket = new WebSocket(
          "ws://" +
            apiUrl +
            "/bus-location?bus=" +
            encodeURIComponent("AAA-1111"),
        );

        await Location.startLocationUpdatesAsync("background-location-task", {
          accuracy: Location.Accuracy.Balanced,
        });
      }
    }
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Button onPress={requestPermissions} title="Enable background location" />
      <Button
        onPress={async () => {
          await Location.stopLocationUpdatesAsync("background-location-task");
        }}
        title="Disable background location"
      />
    </View>
  );
};

export default Index;
