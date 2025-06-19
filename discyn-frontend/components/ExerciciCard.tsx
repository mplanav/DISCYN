import React from "react"
import { View, Text, Image, StyleSheet } from "react-native"
import config from "../config"

interface Props {
  exercici: {
    nom: string
    imatge: string
    grups_musculars?: string[] | null
  }
}

export default function ExerciciCard({ exercici }: Props) {
  const hasGroups = Array.isArray(exercici.grups_musculars) && exercici.grups_musculars.length > 0
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: `${config.API_BASE_URL}${exercici.imatge}` }}
        style={styles.image}
        resizeMode="cover"
      />

      <Text style={styles.title}>{exercici.nom}</Text>

      {hasGroups && (
        <>
          <Text style={styles.subtitle}>Grups musculars:</Text>
          <View style={styles.tagsContainer}>
            {exercici.grups_musculars!.map((grup, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{grup}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 160,
    borderRadius: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  subtitle: {
    color: "#9CA3AF",
    fontSize: 14,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    backgroundColor: "#374151",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    color: "#D1D5DB",
    fontSize: 12,
  },
})
