import React, { useEffect, useState, useCallback } from 'react'
import { View, StyleSheet, Text, FlatList, ActivityIndicator, SafeAreaView } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import config from '../../config'
import RoutineCard from '../../components/RutinaProfCard'
import { Rutina } from '../../type'

const AdminHome = () => {
  const [rutines, setRutines] = useState<Rutina[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFrequentRutines = async () => {
    try {
      const token = await AsyncStorage.getItem('session_token')
      const res = await fetch(`${config.API_BASE_URL}/rutines/frequent`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Error loading frequent rutines')
      setRutines(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchFrequentRutines()
  }, [])

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    fetchFrequentRutines()
  }, [])

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Most Common Routines</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#3B82F6" />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : rutines.length === 0 ? (
          <Text style={styles.noData}>There are no frequent routines</Text>
        ) : (
          <FlatList
            data={rutines}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <RoutineCard rutina={item} />}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111827',
  },
  container: {
    flex: 1,
    padding: 16,
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
  noData: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 20,
  },
})

export default AdminHome
