import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import DadaRendimentInput from './DataRendiment'

type DadaRendiment = {
  num: number | null
  temps: string | null
  distancia: number | null
}

type Serie = {
  exercicir_id: number
  tipus: 'rendiment'
  dades: DadaRendiment[]
}

type Props = {
  serie: Serie
  onUpdateDada: (index: number, field: keyof DadaRendiment, value: any) => void
}

const SerieRendimentItem: React.FC<Props> = ({ serie, onUpdateDada }) => {
  return (
    <View style={styles.serieContainer}>
      <Text style={styles.serieTitle}>Ejercicio ID {serie.exercicir_id}</Text>
      {serie.dades.map((dada, i) => (
        <DadaRendimentInput
          key={i}
          dada={dada}
          onChange={(field, value) => onUpdateDada(i, field, value)}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  serieContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#1F2937',
    borderRadius: 12,
  },
  serieTitle: {
    color: '#F9FAFB',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 12,
  },
})

export default SerieRendimentItem
