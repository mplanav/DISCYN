import React from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from 'react-native'

type TextInputFieldProps = {
  label: string
  icon?: React.ReactNode
} & TextInputProps

const AuthTextInput: React.FC<TextInputFieldProps> = ({
  label,
  icon,
  ...textInputProps
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <TextInput
          style={[styles.input, icon ? { paddingLeft: 40 } : undefined]}
          placeholderTextColor="#9CA3AF" 
          {...textInputProps}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  icon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  input: {
    backgroundColor: '#374151', 
    color: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4B5563',
    fontSize: 16,
  },
})

export default AuthTextInput
