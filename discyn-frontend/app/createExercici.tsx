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
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import config from '../config'
import * as ImagePicker from 'expo-image-picker'
import AlertModal from '../components/alertModel'

const CreateExercici = () => {
  const [nom, setNom] = useState('')
  const [image, setImage] = useState<{ uri: string; name: string; type: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const [alertVisible, setAlertVisible] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertTitle, setAlertTitle] = useState('')
  const [alertType, setAlertType] = useState<'error' | 'success' | 'info'>('info')

  const [grupsOptions, setGrupsOptions] = useState<{ label: string; value: string }[]>([])
  const [selectedGrups, setSelectedGrups] = useState<string[]>([])

  const [searchText, setSearchText] = useState('')
  const [filteredOptions, setFilteredOptions] = useState<{ label: string; value: string }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

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
        setFilteredOptions(options)
      } catch (error) {
        showAlert('Error cargando grupos musculares', 'Error', 'error')
      }
    })()
  }, [])

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredOptions(grupsOptions.filter(opt => !selectedGrups.includes(opt.value)))
    } else {
      const filtered = grupsOptions.filter(
        (opt) =>
          opt.label.toLowerCase().includes(searchText.toLowerCase()) &&
          !selectedGrups.includes(opt.value)
      )
      setFilteredOptions(filtered)
    }
  }, [searchText, grupsOptions, selectedGrups])

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
      setSearchText('')
    } catch (error) {
      showAlert(error instanceof Error ? error.message : String(error), 'Error', 'error')
    } finally {
      setLoading(false)
    }
  }

  const onSelectGrup = (grup: string) => {
    setSelectedGrups((prev) => [...prev, grup])
    setSearchText('')
    setShowSuggestions(false)
    Keyboard.dismiss()
  }

  const onRemoveGrup = (grup: string) => {
    setSelectedGrups((prev) => prev.filter(g => g !== grup))
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0F172A' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
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

        <View style={[styles.inputGroup, { zIndex: 1500 }]}>
          <Text style={styles.label}>Select Muscle Groups</Text>
          <TextInput
            style={styles.input}
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text)
              setShowSuggestions(true)
            }}
            placeholder="Write to search muscle groups..."
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            editable={!loading}
            onFocus={() => setShowSuggestions(true)}
          />
          {showSuggestions && filteredOptions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={filteredOptions}
                keyExtractor={(item) => item.value}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() => onSelectGrup(item.value)}
                  >
                    <Text style={styles.suggestionText}>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {selectedGrups.length > 0 && (
            <View style={styles.selectedTagsContainer}>
              {selectedGrups.map((grup, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{grup}</Text>
                  <TouchableOpacity onPress={() => onRemoveGrup(grup)} style={styles.tagRemoveButton}>
                    <Text style={styles.tagRemoveText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
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
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 64,
    backgroundColor: '#0F172A',
    flex: 1,
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
    zIndex: 10,
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
  suggestionsContainer: {
    maxHeight: 150,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 4,
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomColor: '#334155',
    borderBottomWidth: 1,
  },
  suggestionText: {
    color: '#F9FAFB',
    fontSize: 16,
  },
  selectedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    color: '#D1D5DB',
    fontSize: 12,
    marginRight: 6,
  },
  tagRemoveButton: {
    paddingHorizontal: 4,
  },
  tagRemoveText: {
    color: '#F87171',
    fontSize: 14,
    fontWeight: 'bold',
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

export default CreateExercici
