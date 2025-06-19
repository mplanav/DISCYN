import React from 'react'
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native'

type AlertModalProps = {
  visible: boolean
  title?: string
  message: string
  onClose: () => void
  type?: 'error' | 'success' | 'info' // para variar colores o iconos si quieres
}

const AlertModal = ({ visible, title, message, onClose, type = 'info' }: AlertModalProps) => {
  const backgroundColors = {
    error: '#F87171',    // rojo
    success: '#34D399',  // verde
    info: '#60A5FA',     // azul
  }

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.container, { borderColor: backgroundColors[type] }]}>
          {title && <Text style={[styles.title, { color: backgroundColors[type] }]}>{title}</Text>}
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity onPress={onClose} style={[styles.button, { backgroundColor: backgroundColors[type] }]}>
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    backgroundColor: '#1F2937',
    padding: 20,
    borderRadius: 12,
    borderWidth: 3,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#E5E7EB',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
})

export default AlertModal
