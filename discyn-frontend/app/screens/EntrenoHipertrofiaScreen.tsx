import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, ScrollView, Button, Alert, StyleSheet, ActivityIndicator } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useLocalSearchParams, useRouter } from 'expo-router'
import config from '../../config'
import { Training } from '../../type'

import SerieHipertrofia from '../../components/SerieHipertrofia'

const router = useRouter()

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

const EntrenoHipertrofiaScreen = () => {
  const { entrenoId } = useLocalSearchParams<{ entrenoId: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [training, setTraining] = useState<Training | null>(null)
  const [sensacions, setSensacions] = useState('')
  const [pesTotal, setPesTotal] = useState(0)
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
        setPesTotal(getData.training.pestotal || 0)
        setDuracioTotal(getData.training.duraciototal || '00:00:00')
        setSeries((getData.series || []).filter((s: Serie) => s.tipus === 'classica'))
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        setLoading(false)
      }
    }

    fetchEntreno()
  }, [entrenoId])

  const updateSerieDada = (exercicir_id: number, dadaIndex: number, field: keyof DadaClassica, value: any) => {
    setSeries(current =>
      current.map(s => {
        if (s.exercicir_id !== exercicir_id) return s

        const dadesClassica = s.dades as DadaClassica[]
        const newDades = dadesClassica.map((d, i) =>
          i === dadaIndex ? { ...d, [field]: value } : d
        )

        return { ...s, dades: newDades }
      })
    )
  }

const handleUpdateEntreno = async () => {
  if (!training || !training.entreno_id) {
    Alert.alert('Error', 'Entreno no cargado todavía.')
    return
  }

  try {
    setLoading(true)
    setError(null)

    const token = await AsyncStorage.getItem('session_token')
    if (!token) throw new Error('No token found')

    // Asegurarse que duraciototal sea string en formato "HH:MM:SS"
    // Si duracioTotal es Date, convertirlo así:
    // const duraciototalStr = duracioTotal instanceof Date ? duracioTotal.toTimeString().slice(0,8) : duracioTotal
    // Aquí asumo que duracioTotal ya está en string correcto
    const duraciototalStr = duracioTotal

    const payload = {
      pestotal: pesTotal,
      duraciototal: duraciototalStr,
      sensacions,
      series, // debe ser array con la estructura correcta para backend
    }

    console.log('Payload para update hipertrofia:', payload)

    const res = await fetch(`${config.API_BASE_URL}/entrenos/entrenos/classica/${training.entreno_id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Error actualizando entreno')

    Alert.alert('Éxito', 'Entreno hipertrofia actualizado correctamente')
    router.replace('/(tabs)')
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
      <Text style={styles.title}>Entreno Hipertrofia ID: {training?.entreno_id}</Text>

      <Text style={styles.label}>Sensaciones:</Text>
      <TextInput
        style={styles.input}
        multiline
        value={sensacions}
        onChangeText={setSensacions}
        placeholder="Cómo te sientes..."
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.label}>Peso Total:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={pesTotal.toString()}
        onChangeText={text => setPesTotal(Number(text) || 0)}
        placeholder="0"
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.label}>Duración Total (HH:MM:SS):</Text>
      <TextInput
        style={styles.input}
        value={duracioTotal}
        onChangeText={setDuracioTotal}
        placeholder="00:00:00"
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.label}>Series y Ejercicios (Clásicas):</Text>
      {series.map(serie => (
        <SerieHipertrofia
          key={serie.exercicir_id}
          serie={serie}
          onUpdateDada={(i, field, value) => updateSerieDada(serie.exercicir_id, i, field, value)}
        />
      ))}

      <View style={styles.buttonContainer}>
        <Button title="Guardar Entreno" color="#3B82F6" onPress={handleUpdateEntreno} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 16,
  },
  label: {
    color: '#F9FAFB',
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1F2937',
    color: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  error: {
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 20,
  },
  buttonContainer: {
    marginTop: 20,
  },
})

export default EntrenoHipertrofiaScreen
