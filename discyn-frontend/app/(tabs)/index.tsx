import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import config from '../../config'
import TrainingCard from '../../components/TrainingCard'
import { Training } from '../../type'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { router } from 'expo-router'

const HomeScreen = () => {
  const [trainings, setTrainings] = useState<Training[]>([])
  const [menuVisible, setMenuVisible] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchTrainings = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('session_token')
      const res = await fetch(`${config.API_BASE_URL}/gymbro/entrenos`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Error loading trainings')

      if (data.message) {
        setError(data.message)
      } else {
        setTrainings(data)
        setError(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTrainings()
  }, [fetchTrainings])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchTrainings()
    setRefreshing(false)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Trainings</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={trainings}
          keyExtractor={(item) => item.entreno_id.toString()}
          renderItem={({ item }) => <TrainingCard training={item} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />
          }
        />
      )}

      {/* Floating Action Button + Speed Dial */}
      <View style={styles.fabContainer}>
        {menuVisible && (
          <View style={styles.fabMenu}>
            <TouchableOpacity style={styles.fabOption} onPress={() => router.push("/createExercici")}>
              <Icon name="dumbbell" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.fabOption} onPress={() => router.push("/createRutina")}>
              <Icon name="calendar-edit" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.fabOption} onPress={() => router.push("/searchUsers")}>
              <Icon name="account-plus" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.fabMain,
            menuVisible && styles.fabMainActive,
          ]}
          onPress={() => setMenuVisible(!menuVisible)}
        >
          <Text style={styles.fabMainText}>...</Text>
        </TouchableOpacity>
      </View>
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
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'center',
  },
  fabMenu: {
    marginBottom: 10,
    alignItems: 'center',
    gap: 12,
  },
  fabOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  fabMain: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  fabMainText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  fabMainActive: {
    backgroundColor: '#1E40AF',
  },
})

export default HomeScreen
