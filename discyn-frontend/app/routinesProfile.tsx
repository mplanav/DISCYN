import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from "react-native"
import config from "../config"
import AsyncStorage from "@react-native-async-storage/async-storage"
import RutinaProfCard from "../components/RutinaProfCard"
import { router } from "expo-router"  // <-- Importa router para navegación
import type { Exercici } from "../type"

export interface Rutina {
  id: number
  nom: string
  created_by: "You"
  exercicis: Exercici[]
  imatge_primer_exercici: string
}

export default function RoutinesProfile() {
  const [rutinas, setRutinas] = useState<Rutina[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRutinas = async () => {
      try {
        const token = await AsyncStorage.getItem("session_token")
        if (!token) {
          throw new Error("No auth token found. Please log in.")
        }

        const response = await fetch(
          `${config.API_BASE_URL}/rutines/user-all`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        )

        if (!response.ok) {
          throw new Error("Error fetching rutinas")
        }

        const data: Rutina[] = await response.json()
        setRutinas(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRutinas()
  }, [])

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    )
  }

  if (rutinas.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.emptyText}>No routines found.</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rutines created by you:</Text>
      </View>

      <FlatList
        data={rutinas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <RutinaProfCard rutina={item} />}
        contentContainerStyle={{ padding: 20, paddingTop: 0 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Botón flotante para crear rutina */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/createRutina")}  // Ajusta ruta según tu archivo
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111827",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 16,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomColor: "#374151",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#3B82F6",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: 36,
    color: "white",
    lineHeight: 36,
  },
})
