
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {


  const router = useRouter();

  return (

    <View style={styles.container}>
      <Text style={styles.title}>Hello Ed, Ready to go?</Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Start"
          onPress={() => {
            console.log("Going to maps ");
            router.push('/map');
          }}
        />
      </View>

      <View>
        <Text style={styles.sectionTitle}>Recent trips</Text>
        <Text style={styles.item}>- Last tracked: Aug 28</Text>
        <Text style={styles.item}>- Distance: 12kms</Text>
        <Text style={styles.item}>- Duration: 32 mins</Text>
      </View>
    </View>

  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  buttonContainer: {
    marginBottom: 40,
    width: "60%",
  },
  section: {
    alignItems: "flex-start",
    width: "100%",
    paddingHorizontal: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  item: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
});

