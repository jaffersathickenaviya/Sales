// import React from "react";
// import { StyleSheet } from "react-native";
// import { WebView } from "react-native-webview";

// export default function MyMap() {
//   const html = `
//     <!DOCTYPE html>
//     <html>
//       <head>
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
//         <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
//         <style>html, body, #map { height: 100%; margin: 0; }</style>
//       </head>
//       <body>
//         <div id="map"></div>
//         <script>
//           var map = L.map('map').setView([28.6139, 77.2090], 13);
//           L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//             maxZoom: 19,
//           }).addTo(map);
//           L.marker([28.6139, 77.2090]).addTo(map)
//             .bindPopup('Delhi')
//             .openPopup();
//         </script>
//       </body>
//     </html>
//   `;

//   return <WebView source={{ html }} style={StyleSheet.absoluteFill} />;
// }

import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View } from "react-native";
import * as Location from "expo-location";
import { WebView } from "react-native-webview";

export default function MapWithTracking() {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const webviewRef = useRef<WebView>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      // Start watching position
      await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 1 },
        (location) => {
          setCoords({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });

          // Update marker in WebView dynamically
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

  if (!coords) return null; // or loading

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
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

  return <WebView ref={webviewRef} source={{ html }} style={StyleSheet.absoluteFill} />;
}
