import React from 'react'
import { Text, StyleSheet } from 'react-native'
type AppTitleProps = {
    title: string
}

const AppTitle:React.FC<AppTitleProps> = ({title}) => {
  return <Text style={styles.title}>{title}</Text>
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'left',
    marginBottom: 24,
  },
})

export default AppTitle
