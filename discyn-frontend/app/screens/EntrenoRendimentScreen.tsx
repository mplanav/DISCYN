import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Button,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useLocalSearchParams } from 'expo-router'
import config from '../../config'
import SerieRendimentItem from '../../components/SerieRendiment'
import { Training } from '../../type'

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

const EntrenoRendimentScreen = () => {
  const { entrenoId } = useLocalSearchParams<{ entrenoId: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [training, setTraining] = useState<Training | null>(null)
  const [sensacions, setSensacions] = useState('')
  const [duracioTotal, setDuracioTotal] = useState('00:00:00')
  const [series, setSeries] = useState<Serie[]>([])

  useEffect(() => {
    if (!entrenoId) return

    const fetchEntreno = async () => {
      try {
        setLoading(true)
        setError(null)

        const token = await AsyncStorage.getItem('session_token')
        if (!token) throw new Error('No token found')

        const getRes = await fetch(`${config.API_BASE_URL}/entrenos/${entrenoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const getData = await getRes.json()
        if (!getRes.ok) throw new Error(getData.detail || 'Error cargando entreno')

        setTraining(getData.training)
        setSensacions(getData.training.sensacions || '')
        setDuracioTotal(getData.training.duraciototal)
        setSeries((getData.series || []).filter((s: Serie) => s.tipus === 'rendiment'))
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        setLoading(false)
      }
    }

    fetchEntreno()
  }, [entrenoId])

  const updateSerieDada = (
    exercicir_id: number,
    dadaIndex: number,
    field: keyof DadaRendiment,
    value: any
  ) => {
    setSeries(current =>
      current.map(s => {
        if (s.exercicir_id !== exercicir_id) return s

        const newDades = s.dades.map((d, i) =>
          i === dadaIndex ? { ...d, [field]: value } : d
        )

        return { ...s, dades: newDades }
      })
    )
  }

  const handleUpdateEntreno = async () => {
    if (!training) {
      Alert.alert('Error', 'Entreno no cargado todavía.')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const token = await AsyncStorage.getItem('session_token')
      if (!token) throw new Error('No token found')

      const payload = {
        duraciototal: duracioTotal,
        sensacions,
        series,
      }

      const res = await fetch(`${config.API_BASE_URL}/entrenos/entrenos/rendiment/${training.entreno_id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Error actualizando entreno')

      Alert.alert('Éxito', 'Entreno rendimiento actualizado correctamente')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Entreno Rendimiento ID: {training?.entreno_id}</Text>

      <Text style={styles.label}>Sensaciones:</Text>
      <TextInput
        style={styles.input}
        multiline
        value={sensacions}
        onChangeText={setSensacions}
        placeholder="Cómo te sientes..."
      />

      <Text style={styles.label}>Duración Total (HH:MM:SS):</Text>
      <TextInput
        style={styles.input}
        value={duracioTotal}
        onChangeText={setDuracioTotal}
        placeholder="00:00:00"
      />

      <Text style={styles.label}>Series y Ejercicios (Rendimiento):</Text>
      {series.map(serie => (
        <SerieRendimentItem
          key={serie.exercicir_id}
          serie={serie}
          onUpdateDada={(index, field, value) =>
            updateSerieDada(serie.exercicir_id, index, field, value)
          }
        />
      ))}

      <Button title="Guardar Entreno" onPress={handleUpdateEntreno} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#F9FAFB', marginBottom: 16 },
  label: { color: '#F9FAFB', marginTop: 16, marginBottom: 8 },
  input: {
    backgroundColor: '#1F2937',
    color: '#F9FAFB',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  error: { color: '#EF4444' },
})

export default EntrenoRendimentScreen
