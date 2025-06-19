import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import config from '../../config'
import { Rutina } from '../../type'
import RoutineCard from '../../components/RoutineCard'
import { useRouter } from 'expo-router'

const backendUrl = `${config.API_BASE_URL}/rutines/visible_for_user`

const RoutinesScreen = () => {
  const [rutines, setRutines] = useState<Rutina[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  const fetchRutines = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('session_token')
      const res = await fetch(backendUrl, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.detail || 'Error loading routines')
      if (data.message) {
        setError(data.message)
        setRutines([])
      } else {
        setRutines(data)
        setError(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRutines()
  }, [fetchRutines])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchRutines()
    setRefreshing(false)
  }

  const handleStartTraining = async (rutinaId: number) => {
    try {
      const token = await AsyncStorage.getItem('session_token')
      if (!token) throw new Error('No token found')

      const createRes = await fetch(
        `${config.API_BASE_URL}/entrenos/create_from_rutina/${rutinaId}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const createData = await createRes.json()
      if (!createRes.ok) throw new Error(createData.detail || 'Error creando entreno')

      const entrenoId = createData.entreno_id

      const entrenoRes = await fetch(`${config.API_BASE_URL}/entrenos/${entrenoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const entrenoData = await entrenoRes.json()
      if (!entrenoRes.ok) throw new Error(entrenoData.detail || 'Error cargando entreno')

      const tipoEntreno = entrenoData.training?.tipo || 'classica'

      if (tipoEntreno === 'classica') {
        router.push(`/screens/EntrenoHipertrofiaScreen?entrenoId=${entrenoId}`)
      } else if (tipoEntreno === 'rendiment') {
        router.push(`/screens/EntrenoRendimentScreen?entrenoId=${entrenoId}`)
      } else {
        router.push(`/screens/EntrenoHipertrofiaScreen?entrenoId=${entrenoId}`)
      }
    } catch (error) {
      console.error('Error al iniciar entrenamiento:', error)
    }
  }

  const renderItem = ({ item }: { item: Rutina }) => (
    console.log(item),
    <RoutineCard rutina={item} onStartTraining={() => handleStartTraining(item.id)} />
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Popular Routines</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={rutines}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    padding: 16,
    paddingTop: 64,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 12,
  },
  error: {
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 20,
  },
})

export default RoutinesScreen
