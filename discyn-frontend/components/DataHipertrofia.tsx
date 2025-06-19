// components/DadaInput.tsx
import React from 'react'
import { View, TextInput, StyleSheet } from 'react-native'

type DadaClassica = {
  num: number | null
  pes: number | null
  repeticions: number | null
}

type Props = {
  dada: DadaClassica
  onChange: (field: keyof DadaClassica, value: number | null) => void
}

const DadaInput: React.FC<Props> = ({ dada, onChange }) => {
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
        keyboardType="numeric"
        placeholder="Peso"
        value={dada.pes?.toString() || ''}
        onChangeText={text => onChange('pes', Number(text) || null)}
      />
      <TextInput
        style={styles.smallInput}
        keyboardType="numeric"
        placeholder="Repeticiones"
        value={dada.repeticions?.toString() || ''}
        onChangeText={text => onChange('repeticions', Number(text) || null)}
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
  },
})

export default DadaInput
