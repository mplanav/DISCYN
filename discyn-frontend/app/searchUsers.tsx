import React, { useState, useEffect } from 'react'
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import config from '../config'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import AlertModal from '../components/alertModel'

type User = {
  persona_id: number
  nom: string
  imatge?: string
}

const AddGymbros = () => {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [gymbros, setGymbros] = useState<User[]>([])
  const [loadingGymbros, setLoadingGymbros] = useState<boolean>(false)
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false)
  const [adding, setAdding] = useState<boolean>(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [alertVisible, setAlertVisible] = useState(false)
  const [alertTitle, setAlertTitle] = useState('')
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('info')

  const showAlert = (
    message: string,
    title = 'Aviso',
    type: 'success' | 'error' | 'info' = 'info'
  ) => {
    setAlertMessage(message)
    setAlertTitle(title)
    setAlertType(type)
    setAlertVisible(true)
  }

  useEffect(() => {
    fetchGymbros()
  }, [])

  const fetchGymbros = async () => {
    setLoadingGymbros(true)
    try {
      const token = await AsyncStorage.getItem('session_token')
      const res = await fetch(`${config.API_BASE_URL}/gymbro/list`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Error cargando gymbros')
      setGymbros(data)
    } catch (error: unknown) {
      showAlert(
        error instanceof Error ? error.message : 'Error cargando gymbros',
        'Error',
        'error'
      )
    } finally {
      setLoadingGymbros(false)
    }
  }

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    setLoadingSearch(true)
    try {
      const token = await AsyncStorage.getItem('session_token')
      const res = await fetch(`${config.API_BASE_URL}/usuaris/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Error buscando usuarios')
      setSearchResults(data)
    } catch (error: unknown) {
      showAlert(
        error instanceof Error ? error.message : 'Error buscando usuarios',
        'Error',
        'error'
      )
    } finally {
      setLoadingSearch(false)
    }
  }

  const handleSearchPress = () => {
    if (searchQuery.trim().length < 3) {
      showAlert('Escribe al menos 3 caracteres para buscar.', 'Atención', 'info')
      return
    }
    searchUsers(searchQuery)
  }

  const addGymbro = async (persona_id: number, nom: string) => {
    showAlert(`¿Quieres añadir a ${nom} como gymbro?`, 'Confirmar', 'info')
    // puedes implementar confirmación con otro modal si quieres más adelante
    setAdding(true)
    try {
      const token = await AsyncStorage.getItem('session_token')
      const res = await fetch(`${config.API_BASE_URL}/gymbro/add`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuari2_id: persona_id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Error añadiendo gymbro')
      showAlert(data.message, 'Éxito', 'success')
      setSearchQuery('')
      setSearchResults([])
      fetchGymbros()
    } catch (error: unknown) {
      showAlert(
        error instanceof Error ? error.message : 'Error añadiendo gymbro',
        'Error',
        'error'
      )
    } finally {
      setAdding(false)
    }
  }

  const deleteGymbro = async (usuari_id: number) => {
    showAlert('¿Quieres eliminar a este gymbro?', 'Confirmar', 'info')
    // de nuevo, esta parte podría requerir confirmación
    setDeletingId(usuari_id)
    try {
      const token = await AsyncStorage.getItem('session_token')
      const res = await fetch(`${config.API_BASE_URL}/gymbro/delete/${usuari_id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Error eliminando gymbro')
      showAlert(data.message, 'Éxito', 'success')
      fetchGymbros()
    } catch (error: unknown) {
      showAlert(
        error instanceof Error ? error.message : 'Error eliminando gymbro',
        'Error',
        'error'
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Add Gymbros</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search user by name..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          editable={!adding}
        />
        <TouchableOpacity onPress={handleSearchPress} style={styles.searchButton}>
          <Icon name="magnify" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {loadingSearch && <ActivityIndicator size="small" color="#10B981" style={{ marginVertical: 10 }} />}

      {searchResults.length > 0 && (
        <ScrollView style={styles.searchResults}>
          {searchResults.map((user) => (
            <TouchableOpacity
              key={user.persona_id}
              style={styles.searchResultItem}
              onPress={() => addGymbro(user.persona_id, user.nom)}
              disabled={adding}
            >
              <Text style={styles.searchResultText}>{user.nom}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Text style={styles.subHeader}>Your Gymbros</Text>

      {loadingGymbros ? (
        <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 20 }} />
      ) : (
        <ScrollView style={styles.gymbrosList}>
          {gymbros.length === 0 ? (
            <Text style={styles.noGymbrosText}>You don't have any Gymbro yet.</Text>
          ) : (
            gymbros.map((gymbro) => (
              <View key={gymbro.persona_id} style={styles.gymbroItem}>
                <Text style={styles.gymbroName}>{gymbro.nom}</Text>
                <TouchableOpacity
                  onPress={() => deleteGymbro(gymbro.persona_id)}
                  disabled={deletingId === gymbro.persona_id}
                >
                  <Icon name="account-remove" size={26} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <AlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  // ... estilos idénticos al código original
  container: {
    flex: 1,
    backgroundColor: '#111827',
    padding: 64,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: "100%",
  },
  input: {
    flex: 1,
    backgroundColor: '#1F2937',
    color: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  searchButton: {
    marginLeft: 10,
    padding: 8,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResults: {
    maxHeight: 150,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    marginTop: 8,
  },
  searchResultItem: {
    padding: 12,
    borderBottomColor: '#374151',
    borderBottomWidth: 1,
  },
  searchResultText: {
    color: '#D1D5DB',
    fontSize: 16,
  },
  subHeader: {
    marginTop: 30,
    fontSize: 18,
    fontWeight: '600',
    color: '#2563EB',
  },
  gymbrosList: {
    marginTop: 12,
  },
  gymbroItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    alignItems: 'center',
  },
  gymbroName: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '500',
  },
  noGymbrosText: {
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
})

export default AddGymbros
