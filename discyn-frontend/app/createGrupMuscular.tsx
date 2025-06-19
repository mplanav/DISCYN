import React, { useState, useEffect } from 'react'
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import config from '../config'
import AlertModal from '../components/alertModel' // Asegúrate de tener este componente

const CreateGrupMuscular = () => {
  const [nom, setNom] = useState('')
  const [image, setImage] = useState<{ uri: string; name: string; type: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const [alertVisible, setAlertVisible] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertTitle, setAlertTitle] = useState('')
  const [alertType, setAlertType] = useState<'error' | 'success' | 'info'>('info')

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        showAlert('Necesitamos permiso para acceder a la galería', 'Permiso denegado', 'error')
      }
    })()
  }, [])

  const showAlert = (message: string, title = '', type: 'error' | 'success' | 'info' = 'info') => {
    setAlertMessage(message)
    setAlertTitle(title)
    setAlertType(type)
    setAlertVisible(true)
  }

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      })

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0]
        let mimeType = 'image/jpeg'
        if (asset.uri.endsWith('.png')) mimeType = 'image/png'
        else if (asset.uri.endsWith('.jpg') || asset.uri.endsWith('.jpeg')) mimeType = 'image/jpeg'

        setImage({
          uri: asset.uri,
          name: asset.fileName || asset.uri.split('/').pop() || 'photo.jpg',
          type: mimeType,
        })
      }
    } catch (error) {
      showAlert('No se pudo seleccionar la imagen', 'Error', 'error')
    }
  }

  const handleSubmit = async () => {
    if (!nom.trim() || !image) {
      showAlert('Completa todos los campos y selecciona una imagen.', 'Error', 'error')
      return
    }

    setLoading(true)
    try {
      const token = await AsyncStorage.getItem('session_token')
      if (!token) throw new Error('No token found')

      const formData = new FormData()
      formData.append('grupmuscular', nom.trim())
      formData.append('image', {
        uri: image.uri,
        name: image.name,
        type: image.type,
      } as any)

      const response = await fetch(`${config.API_BASE_URL}/grupmuscular/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Error creando grupo muscular')

      showAlert(data.message, 'Éxito', 'success')
      setNom('')
      setImage(null)
    } catch (error) {
      showAlert(error instanceof Error ? error.message : String(error), 'Error', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Create Muscle Group</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Muscle group name</Text>
        <TextInput
          style={styles.input}
          value={nom}
          onChangeText={setNom}
          placeholder="Ej: Biceps..."
          placeholderTextColor="#6B7280"
          autoCapitalize="words"
          editable={!loading}
        />
      </View>

      <TouchableOpacity
        style={styles.imagePickerButton}
        onPress={pickImage}
        disabled={loading}
      >
        <Ionicons name="image-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.imagePickerButtonText}>
          {image ? 'Change Image' : 'Select Image'}
        </Text>
      </TouchableOpacity>

      {image && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: image.uri }} style={styles.imagePreview} />
          <Text style={styles.imageInfo}>{image.name}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#111827" />
        ) : (
          <Text style={styles.submitButtonText}>Create Muscle Group</Text>
        )}
      </TouchableOpacity>

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
    paddingTop: 64,
    backgroundColor: '#111827',
    flexGrow: 1,
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
  imagePickerButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 10,
  },
  imagePickerButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  imagePreviewContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  imagePreview: {
    width: 220,
    height: 220,
    borderRadius: 20,
  },
  imageInfo: {
    marginTop: 8,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 30,
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

export default CreateGrupMuscular
