import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Training } from '../type'
import config from "../config"

type Props = {
  training: Training
}

const getExerciseImage = (name: string) => {
  const map: Record<string, string> = {
    'Sentadilles': 'https://example.com/sentadilla.jpg',
    'Planxa': 'https://example.com/planxa.jpg',
    'Flexions': 'https://example.com/flexions.jpg',
    'Abdominals': 'https://example.com/abdominals.jpg',
    'Escaladors': 'https://example.com/escaladors.jpg',
    'Pes mort': 'https://example.com/pesmort.jpg',
    'Cursa contínua': 'https://example.com/cursa.jpg',
    'Salt a la corda': 'https://example.com/salt.jpg',
    'Rem amb barra': 'https://example.com/rem.jpg',
    'Burpees': 'https://example.com/burpees.jpg',
  }
  return map[name] || 'https://example.com/default.jpg'
}

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const TrainingCard: React.FC<Props> = ({ training }) => {
  return (
    <View style={styles.card}>
      {/* Usuario */}
      <View style={styles.userRow}>
        {training.usuari_foto?.trim() ? (
          <Image
            source={{ uri: `${config.API_BASE_URL}${training.usuari_foto}` }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person-circle-outline" size={42} color="#9CA3AF" />
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={styles.name}>{training.usuari_nom}</Text>
          <Text style={styles.routine}>{training.rutina_nom}</Text>
        </View>
        <Text style={styles.date}>{formatDate(training.datahora)}</Text>
      </View>

      {/* Estadísticas */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="barbell-outline" size={20} color="#6B7280" />
          <Text style={styles.statLabel}>Peso total</Text>
          <Text style={styles.statValue}>{training.pestotal ?? 'N/A'} kg</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={20} color="#6B7280" />
          <Text style={styles.statLabel}>Duración</Text>
          <Text style={styles.statValue}>{training.duraciototal}</Text>
        </View>
        {training.sensacions && (
          <View style={styles.statItem}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#6B7280" />
            <Text style={styles.statLabel}>Sensaciones</Text>
            <Text style={styles.statValue}>{training.sensacions}</Text>
          </View>
        )}
      </View>

      {/* Ejercicio destacado */}
      <View style={styles.exerciseBlock}>
        <Image source={{ uri: getExerciseImage(training.primer_exercici) }} style={styles.exerciseImage} />
        <Text style={styles.exerciseText}>{training.primer_exercici}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '600',
  },
  routine: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  date: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  statItem: {
    alignItems: 'center',
    width: '30%',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  statValue: {
    fontSize: 14,
    color: '#E5E7EB',
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  exerciseBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 10,
    backgroundColor: '#1F2937',
    borderRadius: 12,
  },
  exerciseImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 12,
  },
  exerciseText: {
    color: '#F3F4F6',
    fontSize: 16,
    fontWeight: '600',
  },
})

export default TrainingCard
