import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, TextInput } from "react-native";
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
      webviewRef.current.injectJavaScript(`
        if (window.routeControl) {
          window.map.removeControl(window.routeControl);
        }
        window.routeControl = L.Routing.control({
          waypoints: [
            L.latLng(${coords.latitude}, ${coords.longitude}),
            L.latLng('${destination.split(",")[0]}', '${destination.split(",")[1]}')
          ],
          routeWhileDragging: false,
          showAlternatives: true
        }).addTo(window.map);
      `);
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
        <style>html, body, #map { height: 100%; margin: 0; }</style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          window.map = L.map('map').setView([${coords.latitude}, ${coords.longitude}], 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
          window.userMarker = L.marker([${coords.latitude}, ${coords.longitude}]).addTo(map).bindPopup('You are here').openPopup();
        </script>
      </body>
    </html>
  `;

  return (
    <View style={{ flex: 1 }}>
      <TextInput
        placeholder="Enter destination lat,lng"
        style={{ height: 50, borderColor: "gray", borderWidth: 1, padding: 10 }}
        value={destination}
        onChangeText={setDestination}
      />
      <WebView ref={webviewRef} source={{ html }} style={StyleSheet.absoluteFill} />
    </View>
  );
}
