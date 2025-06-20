import { Ionicons } from "@expo/vector-icons"
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
import config from '../config'
import * as ImagePicker from 'expo-image-picker'
import AlertModal from '../components/alertModel'
import DropDownPicker from 'react-native-dropdown-picker'

const CreateExercici = () => {
  const [nom, setNom] = useState('')
  const [image, setImage] = useState<{ uri: string; name: string; type: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const [alertVisible, setAlertVisible] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertTitle, setAlertTitle] = useState('')
  const [alertType, setAlertType] = useState<'error' | 'success' | 'info'>('info')

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [selectedGrups, setSelectedGrups] = useState<string[]>([])
  const [grupsOptions, setGrupsOptions] = useState<{ label: string; value: string }[]>([])

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        showAlert('Necesitamos permiso para acceder a la galería', 'Permiso denegado', 'error')
      }

      try {
        const token = await AsyncStorage.getItem('session_token')
        const res = await fetch(`${config.API_BASE_URL}/grupmuscular/read-all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await res.json()
        if (!res.ok) throw new Error('Error cargando grupos musculares')

        const options = data.map((item: any) => ({
          label: item.nom,
          value: item.nom,
        }))

        setGrupsOptions(options)
      } catch (error) {
        showAlert('Error cargando grupos musculares', 'Error', 'error')
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
    if (!nom.trim() || selectedGrups.length === 0 || !image) {
      showAlert('Completa todos los campos y selecciona una imagen.', 'Error', 'error')
      return
    }

    setLoading(true)
    try {
      const token = await AsyncStorage.getItem('session_token')
      if (!token) throw new Error('No token found')

      const formData = new FormData()
      formData.append('nom', nom.trim())
      formData.append('grups_musculars', selectedGrups.join(','))
      formData.append('imatge', {
        uri: image.uri,
        name: image.name,
        type: image.type,
      } as any)

      const response = await fetch(`${config.API_BASE_URL}/exercicis/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Error creando ejercicio')

      showAlert(data.message, 'Successful', 'success')
      setNom('')
      setSelectedGrups([])
      setImage(null)
    } catch (error) {
      showAlert(error instanceof Error ? error.message : String(error), 'Error', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Create Exercice</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Exercice Name</Text>
        <TextInput
          style={styles.input}
          value={nom}
          onChangeText={setNom}
          placeholder="Ej: Curl de bíceps..."
          placeholderTextColor="#9CA3AF"
          autoCapitalize="sentences"
          editable={!loading}
        />
      </View>

      {/* Aquí incrementamos zIndex para que el dropdown quede encima */}
      <View style={[styles.inputGroup, { zIndex: 1500 }]}>
        <Text style={styles.label}>Select Muscle Groups</Text>
        <DropDownPicker
          open={dropdownOpen}
          setOpen={setDropdownOpen}
          items={grupsOptions}
          setItems={setGrupsOptions}
          value={selectedGrups}
          setValue={setSelectedGrups}
          multiple={true}
          placeholder="Select one or more groups..."
          listMode="SCROLLVIEW"
          style={styles.dropdown}
          dropDownContainerStyle={{
            maxHeight: 500,
            backgroundColor: '#1E293B',
            borderColor: '#334155',
            borderRadius: 12,
            zIndex: 9999,
            overflow: 'scroll',
          }}
          scrollViewProps={{
            nestedScrollEnabled: true,
            keyboardShouldPersistTaps: 'handled',
          }}
          textStyle={styles.dropdownText}
          placeholderStyle={styles.dropdownPlaceholder}
          selectedItemLabelStyle={styles.dropdownSelectedItem}
          badgeStyle={styles.dropdownBadge}
          badgeTextStyle={styles.dropdownBadgeText}
          disabled={loading}
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
          <Text style={styles.submitButtonText}>Create Exercice</Text>
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
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
    backgroundColor: '#0F172A',
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
    zIndex: 10, // necesario para DropDownPicker
  },
  label: {
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#1E293B',
    color: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
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
  dropdown: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 8,
    minHeight: 48,
    zIndex: 1000,
  },
  dropdownContainer: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderRadius: 12,
    zIndex: 999,
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

export default CreateExercici
