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
import AsyncStorage from "@react-native-async-storage/async-storage"
import config from "../config"
import ExerciciCard from "../components/ExerciciCard"
import { router } from "expo-router"

interface Exercici {
  nom: string
  imatge: string
  grups_musculars: string[]
}

export default function ExercicisProfile() {
  const [exercicis, setExercicis] = useState<Exercici[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchExercicis = async () => {
      try {
        setLoading(true)
        const token = await AsyncStorage.getItem("session_token")
        if (!token) throw new Error("No auth token found")

        const response = await fetch(`${config.API_BASE_URL}/exercicis/read-user`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })

        if (!response.ok) throw new Error("Error fetching exercicis")

        const data: Exercici[] = await response.json()
        setExercicis(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchExercicis()
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

  if (exercicis.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.emptyText}>No exercises found.</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your exercises:</Text>
      </View>

      <FlatList
        data={exercicis}
        keyExtractor={(item) => item.nom}
        renderItem={({ item }) => <ExerciciCard exercici={item} />}
        contentContainerStyle={{ padding: 20, paddingTop: 0 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Botón flotante */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/createExercici")}
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
