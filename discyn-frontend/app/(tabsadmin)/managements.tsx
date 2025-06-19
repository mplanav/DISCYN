import React, { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  StatusBar,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import AlertModal from "../../components/alertModel" // Asegúrate de tener este componente

export default function AdminManagements() {
  const [alertVisible, setAlertVisible] = useState(false)
  const [alertTitle, setAlertTitle] = useState("")
  const [alertMessage, setAlertMessage] = useState("")
  const [alertType, setAlertType] = useState<"success" | "error" | "info">("info")

  const showAlert = (
    message: string,
    title = "Aviso",
    type: "success" | "error" | "info" = "info"
  ) => {
    setAlertMessage(message)
    setAlertTitle(title)
    setAlertType(type)
    setAlertVisible(true)
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("../../assets/images/adminpanel3.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={styles.buttonsContainer}>
            <Text style={styles.title}>Admin Panel</Text>

            <TouchableOpacity
              style={styles.cardButton}
              onPress={() => router.push("/createExercici")}
            >
              <Ionicons name="barbell-outline" size={24} color="#3B82F6" style={styles.icon} />
              <Text style={styles.cardText}>Create Exercise</Text>
              <Ionicons name="fitness-outline" size={24} color="#3B82F6" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cardButton}
              onPress={() => router.push("/createGrupMuscular")}
            >
              <Ionicons name="body-outline" size={24} color="#3B82F6" style={styles.icon} />
              <Text style={styles.cardText}>Add Muscle Group</Text>
              <Ionicons name="accessibility-outline" size={24} color="#3B82F6" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cardButton}
              onPress={() => router.push("/createRutina")}
            >
              <Ionicons name="repeat-outline" size={24} color="#3B82F6" style={styles.icon} />
              <Text style={styles.cardText}>Create Routine</Text>
              <Ionicons name="list-outline" size={24} color="#3B82F6" />
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>

      <AlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.85)",
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 40,
    marginBottom: 32,
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    width: "100%",
    paddingBottom: 40,
  },
  cardButton: {
    backgroundColor: "#1F2937",
    width: "90%",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  cardText: {
    color: "#E5E7EB",
    fontSize: 18,
    fontWeight: "600",
  },
  icon: {
    marginRight: 12,
  },
})
