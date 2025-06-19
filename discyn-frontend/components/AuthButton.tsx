import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'

type AuthButtonProps = {
  title: string
  onPress: () => void
  disabled?: boolean
}

const AuthButton: React.FC<AuthButtonProps> = ({ title, onPress, disabled }) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    backgroundColor: '#2563EB', 
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8, 
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, 
    shadowRadius: 4,
    elevation: 4, 
  },
  disabled: {
    backgroundColor: '#93c5fd', 
  },
  buttonText: {
    color: '#fff', 
    fontWeight: 'bold',
    fontSize: 16,
  },
})

export default AuthButton
