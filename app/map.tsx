// app/map.tsx
import { View, StyleSheet } from "react-native";
import MyMap from "../components/MapView";

export default function MapPage() {
  return (
    <View style={styles.container}>
      <MyMap />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
