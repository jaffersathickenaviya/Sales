import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, TextInput, Text } from "react-native";
import * as Location from "expo-location";
import { WebView } from "react-native-webview";

export default function MapWithRouting() {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [destination, setDestination] = useState("");
  const webviewRef = useRef<WebView>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 1 },
        (location) => {
          setCoords({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });

          if (webviewRef.current) {
            webviewRef.current.injectJavaScript(`
              if (window.userMarker) {
                window.userMarker.setLatLng([${location.coords.latitude}, ${location.coords.longitude}]);
                window.map.setView([${location.coords.latitude}, ${location.coords.longitude}]);
              }
            `);
          }
        }
      );
    })();
  }, []);

  useEffect(() => {
    if (destination && coords && webviewRef.current) {
      const [latStr, lngStr] = destination.split(",");
      const destLat = parseFloat(latStr.trim());
      const destLng = parseFloat(lngStr.trim());

      if (!isNaN(destLat) && !isNaN(destLng)) {
        webviewRef.current.injectJavaScript(`
          if (window.routeControl) {
            window.map.removeControl(window.routeControl);
          }
          window.routeControl = L.Routing.control({
            waypoints: [
              L.latLng(${coords.latitude}, ${coords.longitude}),
              L.latLng(${destLat}, ${destLng})
            ],
            routeWhileDragging: false,
            showAlternatives: true
          }).addTo(window.map);
        `);
      }
    }
  }, [destination, coords]);

  if (!coords) return null;

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
    <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.css" />
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    <script src="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.js"></script>
    <style>
      html, body, #map { height: 100%; margin: 0; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      // Initialize map
      window.map = L.map('map', {
        zoomControl: false // disable default top-left zoom control
      }).setView([${coords.latitude}, ${coords.longitude}], 15);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

      // Add zoom control in bottom-right
      L.control.zoom({
        position: 'bottomright'
      }).addTo(map);

      // Add user marker
      window.userMarker = L.marker([${coords.latitude}, ${coords.longitude}])
        .addTo(map)
        .bindPopup('You are here')
        .openPopup();
    </script>
  </body>
</html>
`;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Enter destination coordinates</Text>
        <TextInput
          placeholder="e.g. 37.7749,-122.4194"
          keyboardType="numbers-and-punctuation"
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
  inputContainer: {
    backgroundColor: "#fff",
    padding: 12,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    zIndex: 1,
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
});
