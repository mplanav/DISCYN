import React from 'react'
import { Text, StyleSheet, TextStyle } from 'react-native'

type TypoProps = {
  title: string
  style?: TextStyle | TextStyle[]
}

const Typo: React.FC<TypoProps> = ({ title, style }) => {
  return <Text style={[styles.welcome, style]}>{title}</Text>
}


const styles = StyleSheet.create({
  welcome: {
    fontSize: 27,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'left',
  },
})

export default Typo
