import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { Rutina } from '../type'
import AuthButton from './AuthButton'  
import config from "../config"


type Props = {
  rutina: Rutina
  onStartTraining?: () => void  
}

const RoutineCard: React.FC<Props> = ({ rutina, onStartTraining }) => {
  return (
    <View style={styles.card}>
        <Image        
        
          source={{ uri: `${config.API_BASE_URL}${rutina.imatge_primer_exercici}` }}
          style={styles.image}
        />
      
      <Text style={styles.name}>{rutina.nom}</Text>
      <Text style={styles.source}>Created by: {rutina.created_by}</Text>
      <Text style={styles.exerciseTitle}>Exercises:</Text>
      {rutina.exercicis.map((ex, idx) => (
        <View key={idx} style={styles.exerciseRow}>
          <Image
            source={{ uri: ex.imatge }}
            style={styles.exerciseImage}
          />
          <Text style={styles.exerciseItem}>• {ex.nom}</Text>
        </View>
      ))}

      {/* Botón para iniciar el entreno */}
      <View style={styles.buttonContainer}>
        <AuthButton
          title="Start Training"
          onPress={() => {
            if (onStartTraining) onStartTraining()
          }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    marginBottom: 12,
  },
  name: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: 'bold',
  },
  source: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8,
  },
  exerciseTitle: {
    color: '#F3F4F6',
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 6,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  exerciseImage: {
    width: 30,
    height: 30,
    borderRadius: 6,
    marginRight: 8,
  },
  exerciseItem: {
    color: '#D1D5DB',
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: 12,
  },
})

export default RoutineCard
