import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, TextInput, Text, Button, Alert } from "react-native";
import * as Location from "expo-location";
import { WebView } from "react-native-webview";

const BACKEND_URL = "http://localhost:4000"; // Replace with your IP if testing on a physical device

export default function MapWithRouting() {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [destination, setDestination] = useState("");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const watchRef = useRef<any>(null);
  const webviewRef = useRef<WebView>(null);

  // Request location permission and start watching immediately
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied!", "Cannot track location without permission.");
        return;
      }

      watchRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 1 },
        async (location) => {
          const { latitude, longitude } = location.coords;
          setCoords({ latitude, longitude });

          // Send location to backend if session started
          if (sessionId) {
            try {
              await fetch(`${BACKEND_URL}/location`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_id: sessionId, latitude, longitude }),
              });
            } catch (err) {
              console.log("Error sending location:", err);
            }
          }

          // Update WebView map marker
          if (webviewRef.current) {
            webviewRef.current.injectJavaScript(`
              if (window.userMarker) {
                window.userMarker.setLatLng([${latitude}, ${longitude}]);
                window.map.setView([${latitude}, ${longitude}]);
              }
            `);
          }
        }
      );
    })();

    return () => {
      if (watchRef.current) watchRef.current.remove();
    };
  }, [sessionId]);

  // Start session
  const startTracking = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/session/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_name: "TestUser" }),
      });
      const data = await res.json();
      setSessionId(data.id);
      Alert.alert("Session started", `Session ID: ${data.id}`);
    } catch (err) {
      console.log("Error starting session:", err);
    }
  };

  // Stop session
  const stopTracking = async () => {
    if (watchRef.current) {
      watchRef.current.remove();
    }
    if (sessionId) {
      try {
        await fetch(`${BACKEND_URL}/session/end`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        });
        Alert.alert("Session ended", `Session ID: ${sessionId}`);
      } catch (err) {
        console.log("Error ending session:", err);
      }
    }
    setSessionId(null);
  };

  // Generate HTML for WebView map
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
        <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.css"/>
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
        <script src="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.js"></script>
        <style>
          html, body, #map { height: 100%; margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          window.map = L.map('map').setView([${coords?.latitude || 0}, ${coords?.longitude || 0}], 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(window.map);
          window.userMarker = L.marker([${coords?.latitude || 0}, ${coords?.longitude || 0}]).addTo(window.map).bindPopup('You are here').openPopup();

          // Optional: routing if destination is set
          window.updateRoute = (destLat, destLng, userLat, userLng) => {
            if (window.routeControl) window.map.removeControl(window.routeControl);
            window.routeControl = L.Routing.control({
              waypoints: [
                L.latLng(userLat, userLng),
                L.latLng(destLat, destLng)
              ],
              routeWhileDragging: false,
              showAlternatives: true
            }).addTo(window.map);
          };
        </script>
      </body>
    </html>
  `;

  // Update route if destination is entered
  useEffect(() => {
    if (destination && coords && webviewRef.current) {
      const [latStr, lngStr] = destination.split(",");
      const destLat = parseFloat(latStr.trim());
      const destLng = parseFloat(lngStr.trim());
      if (!isNaN(destLat) && !isNaN(destLng)) {
        webviewRef.current.injectJavaScript(`window.updateRoute(${destLat}, ${destLng}, ${coords.latitude}, ${coords.longitude});`);
      }
    }
  }, [destination, coords]);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.controls}>
        <Button title="Start Tracking" onPress={startTracking} />
        <Button title="Stop Tracking" onPress={stopTracking} />
        <TextInput
          placeholder="Enter destination e.g. 12.97,77.59"
          style={styles.input}
          value={destination}
          onChangeText={setDestination}
        />
      </View>
      <WebView ref={webviewRef} source={{ html }} style={StyleSheet.absoluteFill} />
    </View>
  );
}

const styles = StyleSheet.create({
  controls: {
    padding: 12,
    backgroundColor: "#fff",
    zIndex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    marginTop: 8,
  },
});
