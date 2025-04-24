import { useState } from "react";
import { View, StyleSheet, Button } from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

let webSocket: WebSocket | undefined;

TaskManager.defineTask<{ locations: Location.LocationObject[] }>(
  "Update Bus Location",
  async ({ data: { locations }, error }) => {
    if (error) {
      console.error(error.message);
      return;
    }

    console.log("Received new locations", locations);
    if (webSocket === undefined) {
      console.error("WebSocket connection not initialized");
      return;
    }
    webSocket.send(JSON.stringify(locations));
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
});

export default function Index() {
  const [selectedLicensePlate, setSelectedLicensePlate] = useState<string>();

  return (
    <View>
      <Picker
        selectedValue={selectedLicensePlate}
        onValueChange={(itemValue: string) =>
          setSelectedLicensePlate(itemValue)
        }
      >
        <Picker.Item label="AAA-1111" value="AAA-1111" />
        <Picker.Item label="BBB-2222" value="BBB-2222" />
      </Picker>
      <Button
        onPress={async () => {
          const { status: foregroundStatus } =
            await Location.requestForegroundPermissionsAsync();
          if (foregroundStatus === "granted") {
            const { status: backgroundStatus } =
              await Location.requestBackgroundPermissionsAsync();
            if (backgroundStatus === "granted") {
              webSocket = new WebSocket(
                "ws://localhost:3000/bus-location?bus=" +
                  encodeURIComponent(selectedLicensePlate ?? ""),
              );
              console.log(
                "ws://localhost:3000/bus-location?bus=" +
                  encodeURIComponent(selectedLicensePlate ?? ""),
              );
              await Location.startLocationUpdatesAsync("Update Bus Location");
            }
          }
        }}
        title="Start location sharing"
      />
      <Button
        onPress={async () => {
          await Location.stopLocationUpdatesAsync("Update Bus Location");
        }}
        title="Stop location sharing"
      />
    </View>
  );
}
