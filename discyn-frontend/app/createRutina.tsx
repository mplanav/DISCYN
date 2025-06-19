import React, { useState, useEffect } from 'react'
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import DropDownPicker from 'react-native-dropdown-picker'
import config from '../config'
import AlertModal from '../components/alertModel'

const CreateRutina = () => {
  const [nom, setNom] = useState('')
  const [selectedExercicis, setSelectedExercicis] = useState<string[]>([])
  const [exercicisOptions, setExercicisOptions] = useState<{ label: string; value: string }[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
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
        if (!response.ok) throw new Error('Error cargando ejercicios')

        const options = data.map((item: any) => ({
          label: item.nom,
          value: item.nom,
        }))
        setExercicisOptions(options)
      } catch (error) {
        showAlert('No se pudieron cargar los ejercicios', 'Error', 'error')
      }
    }

    fetchExercicis()
  }, [])

  const handleSubmit = async () => {
    if (!nom || selectedExercicis.length === 0) {
      showAlert('Completa todos los campos.', 'Error', 'error')
      return
    }

    setLoading(true)
    try {
      const token = await AsyncStorage.getItem('session_token')
      if (!token) throw new Error('No token found')

      const formData = new FormData()
      formData.append('nom', nom)
      formData.append('exercicis', selectedExercicis.join(','))

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
      setSelectedExercicis([])
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

      <View style={[styles.inputGroup, { zIndex: 10 }]}>
        <Text style={styles.label}>Select Exercises</Text>
        <DropDownPicker
          open={dropdownOpen}
          setOpen={setDropdownOpen}
          items={exercicisOptions}
          setItems={setExercicisOptions}
          value={selectedExercicis}
          setValue={setSelectedExercicis}
          multiple={true}
          placeholder="Select 1 or more"
          listMode="SCROLLVIEW"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          textStyle={styles.dropdownText}
          placeholderStyle={styles.dropdownPlaceholder}
          selectedItemLabelStyle={styles.dropdownSelectedItem}
          badgeStyle={styles.dropdownBadge}
          badgeTextStyle={styles.dropdownBadgeText}
          disabled={loading}
        />
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
  dropdown: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 8,
    minHeight: 48,
  },
  dropdownContainer: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderRadius: 12,
  },
  dropdownText: {
    color: '#F9FAFB',
    fontSize: 16,
  },
  dropdownPlaceholder: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  dropdownSelectedItem: {
    fontWeight: 'bold',
    color: '#10B981',
  },
  dropdownBadge: {
    backgroundColor: '#10B981',
  },
  dropdownBadgeText: {
    color: '#111827',
    fontWeight: 'bold',
  },
})

export default CreateRutina
