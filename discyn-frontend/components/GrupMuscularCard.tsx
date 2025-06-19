import React, { useState } from "react"
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native"
import config from "../config"

interface GrupMuscularCardProps {
  grup: {
    nom: string
    imatge: string
  }
}

export default function GrupMuscularCard({ grup }: GrupMuscularCardProps) {
  const [modalVisible, setModalVisible] = useState(false)
  return (
    <TouchableOpacity onPress={ () => setModalVisible(true)}>
      <View style={styles.card}>
        <Image source={{ uri: `${config.API_BASE_URL}${grup.imatge}` }} style={styles.image} />
        <Text style={styles.name}>{grup.nom}</Text>
      </View>
    </TouchableOpacity>
    
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1F2937", 
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  image: {
    width: "100%",
    height: 260,
    borderRadius: 16,
    marginBottom: 14,
    resizeMode: "cover", 
  },
  name: {
    color: "#E2E8F0", 
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
  },
})

