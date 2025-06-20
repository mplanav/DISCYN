import React, { useState, useEffect } from 'react'
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import config from '../config'
import AlertModal from '../components/alertModel'

const CreateRutina = () => {
  const [nom, setNom] = useState('')
  const [exercicisDisponibles, setExercicisDisponibles] = useState<any[]>([])
  const [exercicisSeleccionats, setExercicisSeleccionats] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

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
    const fetchExercicis = async () => {
      try {
        const token = await AsyncStorage.getItem('session_token')
        const response = await fetch(`${config.API_BASE_URL}/exercicis/read-user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.detail || 'Error cargando ejercicios')
        setExercicisDisponibles(data)
      } catch (error) {
        showAlert(error instanceof Error ? error.message : String(error), 'Error', 'error')
      }
    }

    fetchExercicis()
  }, [])

  const toggleSeleccion = (nombre: string) => {
    setExercicisSeleccionats(prev =>
      prev.includes(nombre) ? prev.filter(e => e !== nombre) : [...prev, nombre]
    )
  }

  const handleSubmit = async () => {
    const trimmedNom = nom.trim()
    if (!trimmedNom || exercicisSeleccionats.length === 0) {
      showAlert('Completa todos los campos.', 'Error', 'error')
      return
    }

    setLoading(true)
    try {
      const token = await AsyncStorage.getItem('session_token')
      if (!token) throw new Error('No token found')

      const formData = new FormData()
      formData.append('nom', trimmedNom)
      formData.append('exercicis', exercicisSeleccionats.join(','))

      const response = await fetch(`${config.API_BASE_URL}/rutines/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Error creando rutina')

      showAlert(data.message, 'Éxito', 'success')
      setNom('')
      setExercicisSeleccionats([])
    } catch (error) {
      showAlert(error instanceof Error ? error.message : String(error), 'Error', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Create Routine</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Routine name</Text>
        <TextInput
          style={styles.input}
          value={nom}
          onChangeText={setNom}
          placeholder="Ej: Strength Training, Cardio Workout"
          placeholderTextColor="#6B7280"
          autoCapitalize="words"
          editable={!loading}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Select Exercises</Text>
        <ScrollView style={styles.dropdownContainer}>
          {exercicisDisponibles.map((ex: any, idx) => {
            const selected = exercicisSeleccionats.includes(ex.nom)
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.exerciseItem, selected && styles.exerciseSelected]}
                onPress={() => toggleSeleccion(ex.nom)}
                disabled={loading}
              >
                <Text style={styles.exerciseTitle}>{ex.nom}</Text>
                {Array.isArray(ex.grups_musculars) && ex.grups_musculars.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {ex.grups_musculars.map((grup: string, i: number) => (
                      <View key={i} style={styles.tag}>
                        <Text style={styles.tagText}>{grup}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      <View style={{ marginTop: 30 }}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#111827" />
          ) : (
            <Text style={styles.submitButtonText}>Create Routine</Text>
          )}
        </TouchableOpacity>
      </View>

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
  container: {
    padding: 24,
    backgroundColor: '#111827',
    flex: 1,
    paddingTop: 64,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#1F2937',
    color: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  dropdownContainer: {
    maxHeight: 200,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  exerciseItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomColor: '#374151',
    borderBottomWidth: 1,
  },
  exerciseSelected: {
    backgroundColor: '#10B98122',
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  tagsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  tag: {
    backgroundColor: '#374151',
    borderRadius: 16,
    paddingHorizontal: 4,
    paddingVertical: 6,
    marginHorizontal: 2,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagText: {
    color: '#D1D5DB',
    fontSize: 12,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#6EE7B7',
  },
  submitButtonText: {
    color: '#111827',
    fontWeight: '700',
    fontSize: 18,
  },
})

export default CreateRutina
