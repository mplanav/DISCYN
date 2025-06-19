export interface Training {
  entreno_id: number
  datahora: string
  pestotal: number | null
  duraciototal: string
  sensacions: string | null
  usuari_nom: string
  usuari_foto: string
  rutina_nom: string
  rutina_id: number
  primer_exercici: string
}

export interface Exercici {
  ordre: number
  nom: string
  imatge: string
}

export interface Rutina {
  id: number
  nom: string
  created_by: 'You' | 'Admin' | 'Gymbro'
  exercicis: Exercici[]
  imatge_primer_exercici: string
}



