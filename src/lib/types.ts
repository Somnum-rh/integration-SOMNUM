// src/lib/types.ts
// Tous les types de l'application SomNum

export type PosteType =
  | 'Médecin'
  | 'Infirmier(e)'
  | 'Technicien du sommeil'
  | 'Assistante médicale'
  | 'Secrétaire médicale';

export type QType = 'post-formation' | '4-6 mois';

export interface ReponseNote {
  questionId: string;
  valeur: number;
}

export interface ReponseOuverte {
  questionId: string;
  texte: string;
}

export interface QuestionNote {
  id: string;
  label: string;
  postes?: PosteType[];
}

export interface QuestionOuverte {
  id: string;
  label: string;
  placeholder: string;
}

export interface Domaine {
  id: string;
  titre: string;
  questionsNotes: QuestionNote[];
  questionsOuvertes: QuestionOuverte[];
}

export interface QuestionnaireConfig {
  type: QType;
  titre: string;
  objectif: string;
  consignes: string;
  domaines: Domaine[];
}

export interface Reponse {
  id: string;
  nom: string;
  prenom: string;
  poste: PosteType;
  questionnaire: QType;
  datePriseDeFonction: string;
  dateCompletion: string;
  referent: string;
  notes: ReponseNote[];
  ouvertes: ReponseOuverte[];
  createdAt: string;
}
