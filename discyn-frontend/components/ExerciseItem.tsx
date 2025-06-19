// components/ExerciseItem.tsx
import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { Exercici } from '../type'

interface Props {
  exercici: Exercici
}

const ExerciseItem = ({ exercici }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.order}>#{exercici.ordre}</Text>
      <Image source={{ uri: exercici.imatge }} style={styles.image} />
      <Text style={styles.name}>{exercici.nom}</Text>
      {/* Aquí más UI para editar series por ejercicio */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  order: {
    color: '#9CA3AF',
    width: 24,
    fontWeight: 'bold',
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  name: {
    color: '#F9FAFB',
    fontSize: 16,
  },
})

export default ExerciseItem
