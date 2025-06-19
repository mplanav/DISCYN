import React from 'react'
import { View, TextInput, StyleSheet } from 'react-native'

type DadaRendiment = {
  num: number | null
  temps: string | null
  distancia: number | null
}

type Props = {
  dada: DadaRendiment
  onChange: (field: keyof DadaRendiment, value: any) => void
}

const DadaRendimentInput: React.FC<Props> = ({ dada, onChange }) => {
  return (
    <View style={styles.dadaRow}>
      <TextInput
        style={styles.smallInput}
        keyboardType="numeric"
        placeholder="Num"
        value={dada.num?.toString() || ''}
        onChangeText={text => onChange('num', Number(text) || null)}
      />
      <TextInput
        style={styles.smallInput}
        placeholder="Tiempo (HH:MM:SS)"
        value={dada.temps || ''}
        onChangeText={text => onChange('temps', text)}
      />
      <TextInput
        style={styles.smallInput}
        keyboardType="numeric"
        placeholder="Distancia"
        value={dada.distancia?.toString() || ''}
        onChangeText={text => onChange('distancia', Number(text) || null)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  dadaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  smallInput: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#6B7280',
    color: '#F9FAFB',
    padding: 8,
    borderRadius: 4,
    textAlign: 'center',
  },
})

export default DadaRendimentInput
