import { View, Text, StyleSheet } from 'react-native'

export default function TodayScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔥 Forged</Text>
      <Text style={styles.subtitle}>Build habits that stick</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0a',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
})
