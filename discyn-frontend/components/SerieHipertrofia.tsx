import React from 'react'
import { View, Text, TextInput, StyleSheet } from 'react-native'

type DadaClassica = {
  num: number | null
  pes: number | null
  repeticions: number | null
}

type Serie = {
  exercicir_id: number
  tipus: 'classica'
  dades: DadaClassica[]
}

type Props = {
  serie: Serie
  onUpdateDada: (index: number, field: keyof DadaClassica, value: any) => void
}

const SerieItem: React.FC<Props> = ({ serie, onUpdateDada }) => {
  return (
    <View style={styles.serieContainer}>
      <Text style={styles.serieTitle}>Ejercicio ID {serie.exercicir_id}</Text>
      {serie.dades.map((dada, i) => (
        <View key={i} style={styles.dadaRow}>
          <TextInput
            style={styles.smallInput}
            keyboardType="numeric"
            placeholder="Num"
            placeholderTextColor="#9CA3AF"
            value={dada.num?.toString() || ''}
            onChangeText={text => onUpdateDada(i, 'num', Number(text) || null)}
          />
          <TextInput
            style={styles.smallInput}
            keyboardType="numeric"
            placeholder="Peso"
            placeholderTextColor="#9CA3AF"
            value={dada.pes?.toString() || ''}
            onChangeText={text => onUpdateDada(i, 'pes', Number(text) || null)}
          />
          <TextInput
            style={styles.smallInput}
            keyboardType="numeric"
            placeholder="Repeticiones"
            placeholderTextColor="#9CA3AF"
            value={dada.repeticions?.toString() || ''}
            onChangeText={text => onUpdateDada(i, 'repeticions', Number(text) || null)}
          />
        </View>
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
  dadaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  smallInput: {
    flex: 1,
    marginHorizontal: 6,
    backgroundColor: '#374151',
    color: '#F9FAFB',
    padding: 8,
    borderRadius: 8,
    fontSize: 14,
    textAlign: 'center',
  },
})

export default SerieItem
