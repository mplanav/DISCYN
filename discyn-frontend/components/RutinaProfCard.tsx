import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface Exercici {
  ordre: number
  nom: string
  imatge: string
}

interface Rutina {
  id: number
  nom: string
  created_by: 'You' | 'Admin' | 'Gymbro'
  exercicis: Exercici[]
  imatge_primer_exercici?: string
}

type Props = {
  rutina: Rutina
}

const RutinaProfCard: React.FC<Props> = ({ rutina }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{rutina.nom}</Text>
      <Text style={styles.label}>Exercises:</Text>
      <Text style={styles.exercises}>
        {rutina.exercicis.length > 0
          ? rutina.exercicis.map((ex) => ex.nom).join(', ')
          : 'No exercises found.'}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderColor: '#374151',
    borderWidth: 1,
  },
  name: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  label: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  exercises: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 20,
  },
})

export default RutinaProfCard
