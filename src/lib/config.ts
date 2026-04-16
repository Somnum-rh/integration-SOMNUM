// src/lib/config.ts
// Configuration des questionnaires et utilitaires de l'application SomNum

import type { PosteType, QuestionnaireConfig } from './types';

// ─── Constantes ───────────────────────────────────────────────────────────────
export const POSTES: PosteType[] = [
  'Médecin',
  'Infirmier(e)',
  'Technicien du sommeil',
  'Assistante médicale',
  'Secrétaire médicale',
];

// ─── Questionnaires par défaut ────────────────────────────────────────────────
export const DEFAULT_QUESTIONNAIRES: QuestionnaireConfig[] = [
  {
    type: 'post-formation',
    titre: 'Bilan Post Formation',
    objectif: "Évaluer les premières impressions, les conditions d'accueil et les besoins immédiats.",
    consignes: '1 = Pas du tout satisfait · 2 = Peu satisfait · 3 = Satisfait · 4 = Très satisfait',
    domaines: [
      {
        id: 'd1_1',
        titre: 'Accueil & prise de poste',
        questionsNotes: [
          { id: 'q1_n1', label: "Qualité de l'accueil le premier jour (présentation locaux, équipes, procédures)" },
          { id: 'q1_n2', label: "Informations transmises avant votre arrivée (planning, documents RH, accès outils)" },
          { id: 'q1_n3', label: "Poste de travail prêt et fonctionnel à votre arrivée (matériel, accès informatique)" },
        ],
        questionsOuvertes: [
          {
            id: 'q1_o1',
            label: "Qu'est-ce qui a manqué lors de votre accueil et qui aurait facilité votre première semaine ?",
            placeholder: 'Informations manquantes, outils non disponibles, personnes à rencontrer...',
          },
        ],
      },
      {
        id: 'd1_2',
        titre: 'Environnement de travail',
        questionsNotes: [
          { id: 'q1_n4', label: 'Confort dans les locaux du cabinet (ergonomie, espace, ambiance)' },
          { id: 'q1_n5', label: 'Équipements spécifiques disponibles et en bon état', postes: ['Technicien du sommeil', 'Infirmier(e)'] },
          { id: 'q1_n6', label: 'Outils informatiques et logiciels métier présentés correctement' },
        ],
        questionsOuvertes: [],
      },
      {
        id: 'd1_3',
        titre: 'Prise en main métier',
        questionsNotes: [
          { id: 'q1_n7', label: 'Missions et responsabilités clairement expliquées' },
          { id: 'q1_n8', label: 'Observation suffisante avant de réaliser les actes en autonomie', postes: ['Médecin', 'Infirmier(e)', 'Technicien du sommeil'] },
          { id: 'q1_n9', label: 'Procédures administratives bien transmises (RDV, facturation, courriers)', postes: ['Assistante médicale', 'Secrétaire médicale'] },
        ],
        questionsOuvertes: [
          {
            id: 'q1_o2',
            label: 'Quelles sont les principales difficultés rencontrées dans la prise en main de votre poste ?',
            placeholder: 'Gestion des outils, organisation, procédures complexes...',
          },
        ],
      },
      {
        id: 'd1_4',
        titre: 'Relations équipe',
        questionsNotes: [
          { id: 'q1_n10', label: 'Disponibilité et soutien de votre tuteur ou référent' },
          { id: 'q1_n11', label: 'Ambiance générale au sein de l\'équipe' },
          { id: 'q1_n12', label: 'Identification claire des bons interlocuteurs pour chaque question' },
        ],
        questionsOuvertes: [],
      },
      {
        id: 'd1_5',
        titre: 'Ressenti global',
        questionsNotes: [
          { id: 'q1_n13', label: 'Satisfaction globale concernant votre première semaine' },
        ],
        questionsOuvertes: [
          {
            id: 'q1_o3',
            label: 'Quels sont les points positifs de cette première période ?',
            placeholder: 'Accueil chaleureux, équipe disponible, missions intéressantes...',
          },
          {
            id: 'q1_o4',
            label: 'Quelles actions concrètes pourrait-on mettre en place pour améliorer votre intégration ?',
            placeholder: 'Formation supplémentaire, accompagnement renforcé, documentation...',
          },
          {
            id: 'q1_o5',
            label: 'Autres remarques ou suggestions',
            placeholder: 'Tout commentaire supplémentaire...',
          },
        ],
      },
    ],
  },
  {
    type: '4-6 mois',
    titre: 'Bilan 4-6 mois',
    objectif: "Évaluer l'intégration complète, les compétences acquises et les perspectives de développement.",
    consignes: '1 = Non atteint · 2 = Partiellement · 3 = Atteint · 4 = Dépassé',
    domaines: [
      {
        id: 'd2_1',
        titre: 'Intégration globale',
        questionsNotes: [
          { id: 'q2_n1', label: "Sentiment d'appartenance à l'équipe et à la structure" },
          { id: 'q2_n2', label: 'Connaissance des procédures internes et de l\'organisation' },
          { id: 'q2_n3', label: 'Aisance dans la communication avec l\'ensemble de l\'équipe' },
        ],
        questionsOuvertes: [
          {
            id: 'q2_o1',
            label: 'Comment décrivez-vous votre intégration au sein de l\'équipe ?',
            placeholder: 'Relations avec les collègues, compréhension de la culture d\'entreprise...',
          },
        ],
      },
      {
        id: 'd2_2',
        titre: 'Maîtrise des compétences',
        questionsNotes: [
          { id: 'q2_n4', label: 'Maîtrise des compétences techniques requises pour votre poste' },
          { id: 'q2_n5', label: 'Autonomie dans la réalisation de vos missions quotidiennes' },
          { id: 'q2_n6', label: 'Capacité à gérer les situations complexes ou imprévues' },
        ],
        questionsOuvertes: [
          {
            id: 'q2_o2',
            label: 'Dans quels domaines ressentez-vous encore des besoins de formation ou d\'accompagnement ?',
            placeholder: 'Compétences techniques, gestion du temps, communication...',
          },
        ],
      },
      {
        id: 'd2_3',
        titre: 'Satisfaction & bien-être',
        questionsNotes: [
          { id: 'q2_n7', label: 'Satisfaction générale vis-à-vis de votre poste et de vos conditions de travail' },
          { id: 'q2_n8', label: 'Équilibre entre vie professionnelle et personnelle' },
          { id: 'q2_n9', label: 'Qualité de la relation avec votre responsable direct' },
        ],
        questionsOuvertes: [
          {
            id: 'q2_o3',
            label: 'Quels éléments influencent le plus votre bien-être au travail ?',
            placeholder: 'Ambiance, autonomie, reconnaissance, charge de travail...',
          },
        ],
      },
      {
        id: 'd2_4',
        titre: 'Perspectives & développement',
        questionsNotes: [
          { id: 'q2_n10', label: 'Clarté de vos perspectives d\'évolution au sein de la structure' },
          { id: 'q2_n11', label: 'Adéquation entre vos aspirations professionnelles et le poste occupé' },
        ],
        questionsOuvertes: [
          {
            id: 'q2_o4',
            label: 'Quelles sont vos aspirations professionnelles pour les 12 prochains mois ?',
            placeholder: 'Montée en compétences, nouvelles responsabilités, formations souhaitées...',
          },
        ],
      },
      {
        id: 'd2_5',
        titre: 'Bilan final',
        questionsNotes: [
          { id: 'q2_n12', label: 'Satisfaction globale après 4 à 6 mois dans la structure' },
        ],
        questionsOuvertes: [
          {
            id: 'q2_o5',
            label: 'Quels sont les points forts de votre intégration que vous souhaiteriez mettre en avant ?',
            placeholder: 'Réussites, apprentissages clés, moments marquants positifs...',
          },
          {
            id: 'q2_o6',
            label: 'Quelles améliorations suggérez-vous pour le processus d\'intégration des futurs collaborateurs ?',
            placeholder: 'Conseils, suggestions de dispositifs, points à renforcer...',
          },
        ],
      },
    ],
  },
];

// ─── Utilitaires statistiques ─────────────────────────────────────────────────
export function moyenne(vals: number[]): number | null {
  if (vals.length === 0) return null;
  return Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 100) / 100;
}

export function niveauLabel(avg: number | null): { label: string; color: string } {
  if (avg === null) return { label: 'N/A', color: '#9CA3AF' };
  if (avg >= 3.5) return { label: 'Excellent', color: '#16A34A' };
  if (avg >= 3)   return { label: 'Satisfaisant', color: '#2563EB' };
  if (avg >= 2.5) return { label: 'À améliorer', color: '#D97706' };
  return { label: 'Insuffisant', color: '#DC2626' };
}

export function genId(): string {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
}

// ─── Admin auth ───────────────────────────────────────────────────────────────
export const ADMIN_PASSWORD_KEY = 'somnum_admin_pwd';
export const ADMIN_AUTH_KEY = 'somnum_admin_auth';
export const DEFAULT_PASSWORD = 'admin1234';

export function getAdminPassword(): string {
  return localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_PASSWORD;
}

export function setAdminPassword(pwd: string): void {
  localStorage.setItem(ADMIN_PASSWORD_KEY, pwd);
}

export function isAdminAuthenticated(): boolean {
  return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
}

export function adminLogin(password: string): boolean {
  if (password === getAdminPassword()) {
    localStorage.setItem(ADMIN_AUTH_KEY, 'true');
    return true;
  }
  return false;
}

export function adminLogout(): void {
  localStorage.removeItem(ADMIN_AUTH_KEY);
}
