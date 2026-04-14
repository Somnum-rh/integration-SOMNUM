// ─── Routes ──────────────────────────────────────────────────────────────────
export const ROUTE_PATHS = {
  HOME: '/',
  QUESTIONNAIRE: '/questionnaire',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────
export type PosteType =
  | 'Médecin'
  | 'Infirmier(e)'
  | 'Technicien du sommeil'
  | 'Assistante médicale'
  | 'Secrétaire médicale';

export type QType = '1 mois' | '3 mois' | '6 mois';

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

export interface ReponseNote {
  questionId: string;
  valeur: number;
}

export interface ReponseOuverte {
  questionId: string;
  texte: string;
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

// ─── Constantes ───────────────────────────────────────────────────────────────
export const POSTES: PosteType[] = [
  'Médecin',
  'Infirmier(e)',
  'Technicien du sommeil',
  'Assistante médicale',
  'Secrétaire médicale',
];

export const ALL_POSTES_OPTIONS: PosteType[] = [
  'Médecin',
  'Infirmier(e)',
  'Technicien du sommeil',
  'Assistante médicale',
  'Secrétaire médicale',
];

// ─── Config par défaut ────────────────────────────────────────────────────────
export const DEFAULT_QUESTIONNAIRES: QuestionnaireConfig[] = [
  {
    type: '1 mois',
    titre: 'Bilan d\'intégration à 1 mois',
    objectif: 'Évaluer les premières impressions, les conditions d\'accueil et les besoins immédiats.',
    consignes: '1 = Pas du tout satisfait(e) · 2 = Peu satisfait(e) · 3 = Satisfait(e) · 4 = Très satisfait(e)',
    domaines: [
      {
        id: 'd1_1',
        titre: 'Accueil & prise de poste',
        questionsNotes: [
          { id: 'q1_n1', label: 'Qualité de l\'accueil le premier jour (présentation locaux, équipes, procédures)' },
          { id: 'q1_n2', label: 'Informations transmises avant votre arrivée (planning, documents RH, accès outils)' },
          { id: 'q1_n3', label: 'Poste de travail prêt et fonctionnel à votre arrivée (matériel, accès informatique)' },
        ],
        questionsOuvertes: [
          { id: 'q1_o1', label: 'Qu\'est-ce qui a manqué lors de votre accueil et qui aurait facilité votre première semaine ?', placeholder: 'Informations manquantes, outils non disponibles, personnes à rencontrer...' },
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
          { id: 'q1_o2', label: 'Quelles sont les principales difficultés rencontrées dans la prise en main de votre poste ?', placeholder: 'Difficultés et domaines nécessitant un soutien supplémentaire...' },
        ],
      },
      {
        id: 'd1_4',
        titre: 'Relations au sein de l\'équipe',
        questionsNotes: [
          { id: 'q1_n10', label: 'Disponibilité et soutien de votre tuteur / référent' },
          { id: 'q1_n11', label: 'Ambiance générale et accueil de vos collègues' },
          { id: 'q1_n12', label: 'Identification claire des interlocuteurs et de leurs rôles' },
        ],
        questionsOuvertes: [],
      },
      {
        id: 'd1_5',
        titre: 'Ressenti global',
        questionsNotes: [
          { id: 'q1_n13', label: 'Satisfaction globale à l\'issue de ce premier mois d\'intégration' },
        ],
        questionsOuvertes: [
          { id: 'q1_o3', label: 'Quels points positifs souhaitez-vous souligner concernant votre intégration ?', placeholder: 'Ce qui s\'est bien passé, ce qui vous a aidé...' },
          { id: 'q1_o4', label: 'Quelles actions concrètes souhaiteriez-vous que le cabinet mette en place ?', placeholder: 'Propositions, besoins spécifiques, souhaits d\'accompagnement...' },
          { id: 'q1_o5', label: 'Avez-vous d\'autres remarques ou suggestions ?', placeholder: 'Remarques libres...' },
        ],
      },
    ],
  },
  {
    type: '3 mois',
    titre: 'Bilan d\'intégration à 3 mois',
    objectif: 'Évaluer la montée en compétences, l\'autonomie acquise et la qualité de l\'accompagnement.',
    consignes: '1 = Pas du tout / Non acquis · 2 = Partiellement · 3 = Satisfait / Acquis · 4 = Très satisfait / Totalement acquis',
    domaines: [
      {
        id: 'd2_1',
        titre: 'Montée en autonomie',
        questionsNotes: [
          { id: 'q2_n1', label: 'Niveau d\'autonomie dans la réalisation de vos missions quotidiennes' },
          { id: 'q2_n2', label: 'Objectifs définis lors du bilan à 1 mois atteints' },
          { id: 'q2_n3', label: 'Maîtrise des protocoles cliniques (pose actimétrie, PSG, scoring)', postes: ['Médecin', 'Infirmier(e)', 'Technicien du sommeil'] },
          { id: 'q2_n4', label: 'Maîtrise des procédures administratives (agenda, facturation, courriers)', postes: ['Assistante médicale', 'Secrétaire médicale'] },
        ],
        questionsOuvertes: [
          { id: 'q2_o1', label: 'Quels sont les domaines de compétences où vous vous sentez encore en difficulté ?', placeholder: 'Compétences à renforcer, actes ou tâches encore incertains...' },
        ],
      },
      {
        id: 'd2_2',
        titre: 'Formation & accompagnement',
        questionsNotes: [
          { id: 'q2_n5', label: 'La formation / accompagnement reçu répond à vos besoins professionnels' },
          { id: 'q2_n6', label: 'Les retours et feedbacks de votre responsable permettent de progresser efficacement' },
        ],
        questionsOuvertes: [
          { id: 'q2_o2', label: 'Quelles formations complémentaires ou accompagnements spécifiques vous seraient utiles ?', placeholder: 'Formations souhaitées, besoins de mentorat...' },
        ],
      },
      {
        id: 'd2_3',
        titre: 'Organisation & outils',
        questionsNotes: [
          { id: 'q2_n7', label: 'Organisation du travail (plannings, répartition des tâches, gestion des urgences)' },
          { id: 'q2_n8', label: 'Logiciels et outils numériques (logiciel sommeil, DMP, messagerie sécurisée)' },
        ],
        questionsOuvertes: [
          { id: 'q2_o3', label: 'Y a-t-il des procédures internes difficiles à appliquer ou peu adaptées ?', placeholder: 'Dysfonctionnements organisationnels, procédures à améliorer...' },
        ],
      },
      {
        id: 'd2_4',
        titre: 'Collaboration & communication',
        questionsNotes: [
          { id: 'q2_n9', label: 'Communication au sein de l\'équipe (informations, réunions, échanges)' },
          { id: 'q2_n10', label: 'Coordination interprofessionnelle (médecins, soignants, administratifs)' },
          { id: 'q2_n11', label: 'Votre avis et vos suggestions sont pris en compte au sein de l\'équipe' },
        ],
        questionsOuvertes: [],
      },
      {
        id: 'd2_5',
        titre: 'Bilan & perspectives',
        questionsNotes: [
          { id: 'q2_n12', label: 'Satisfaction globale à 3 mois d\'intégration' },
        ],
        questionsOuvertes: [
          { id: 'q2_o4', label: 'Quels ont été vos principaux apprentissages et réussites depuis votre arrivée ?', placeholder: 'Ce que vous avez appris, situations maîtrisées, progrès accomplis...' },
          { id: 'q2_o5', label: 'Quels objectifs souhaiteriez-vous vous fixer pour les 3 prochains mois ?', placeholder: 'Objectifs personnels et professionnels...' },
          { id: 'q2_o6', label: 'Avez-vous d\'autres remarques ou suggestions ?', placeholder: 'Remarques libres...' },
        ],
      },
    ],
  },
  {
    type: '6 mois',
    titre: 'Bilan d\'intégration à 6 mois',
    objectif: 'Évaluer l\'intégration complète, la maîtrise des compétences et les perspectives de développement.',
    consignes: '1 = Non atteint / Insatisfaisant · 2 = Partiellement · 3 = Atteint / Satisfaisant · 4 = Dépassé / Excellent',
    domaines: [
      {
        id: 'd3_1',
        titre: 'Intégration globale',
        questionsNotes: [
          { id: 'q3_n1', label: 'Sentiment de pleine intégration au sein de l\'équipe' },
          { id: 'q3_n2', label: 'Le processus d\'intégration a permis d\'atteindre le niveau requis pour le poste' },
          { id: 'q3_n3', label: 'La culture du cabinet correspond aux attentes initiales (valeurs, relation patient)' },
        ],
        questionsOuvertes: [
          { id: 'q3_o1', label: 'Qu\'est-ce qui vous a le plus aidé dans votre intégration ? Qu\'aurait-on pu faire différemment ?', placeholder: 'Retour critique et constructif sur le parcours d\'intégration global...' },
        ],
      },
      {
        id: 'd3_2',
        titre: 'Maîtrise des compétences clés',
        questionsNotes: [
          { id: 'q3_n4', label: 'Niveau de maîtrise des compétences cliniques attendues (consultations, interprétation PSG...)', postes: ['Médecin', 'Infirmier(e)', 'Technicien du sommeil'] },
          { id: 'q3_n5', label: 'Maîtrise des compétences administratives (facturation, planification, relation patient)', postes: ['Assistante médicale', 'Secrétaire médicale'] },
          { id: 'q3_n6', label: 'Maîtrise de l\'ensemble des outils numériques et logiciels du cabinet' },
        ],
        questionsOuvertes: [
          { id: 'q3_o2', label: 'Y a-t-il des compétences que vous n\'avez pas encore eu l\'opportunité de développer ?', placeholder: 'Compétences non développées, domaines restant à approfondir...' },
        ],
      },
      {
        id: 'd3_3',
        titre: 'Satisfaction & bien-être',
        questionsNotes: [
          { id: 'q3_n7', label: 'Niveau de bien-être et d\'épanouissement professionnel au cabinet' },
          { id: 'q3_n8', label: 'Équilibre entre charge de travail et ressources (temps, soutien, matériel)' },
          { id: 'q3_n9', label: 'Qualité des relations avec collègues et responsable' },
        ],
        questionsOuvertes: [
          { id: 'q3_o3', label: 'Qu\'est-ce qui impacte le plus positivement ou négativement votre bien-être au travail ?', placeholder: 'Facteurs de satisfaction et d\'insatisfaction au quotidien...' },
        ],
      },
      {
        id: 'd3_4',
        titre: 'Perspectives & développement',
        questionsNotes: [
          { id: 'q3_n10', label: 'Perspectives d\'évolution au cabinet répondent aux aspirations professionnelles' },
          { id: 'q3_n11', label: 'Intention de continuer à exercer au sein de ce cabinet sur le long terme' },
        ],
        questionsOuvertes: [
          { id: 'q3_o4', label: 'Quelles formations ou évolutions souhaiteriez-vous pour l\'année à venir ?', placeholder: 'DPC, formations spécialisées en médecine du sommeil, nouvelles responsabilités...' },
        ],
      },
      {
        id: 'd3_5',
        titre: 'Bilan final',
        questionsNotes: [
          { id: 'q3_n12', label: 'Satisfaction globale après 6 mois au sein du cabinet' },
        ],
        questionsOuvertes: [
          { id: 'q3_o5', label: 'Quelles recommandations feriez-vous pour améliorer l\'intégration des futurs collaborateurs ?', placeholder: 'Propositions concrètes pour améliorer le parcours d\'intégration futur...' },
          { id: 'q3_o6', label: 'Souhaitez-vous aborder d\'autres points lors de l\'entretien de bilan avec votre responsable ?', placeholder: 'Sujets à aborder, demandes particulières...' },
        ],
      },
    ],
  },
];

// ─── Storage config questionnaires ───────────────────────────────────────────
const CONFIG_STORAGE_KEY = 'cabinet_sommeil_config';

export function getQuestionnaires(): QuestionnaireConfig[] {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) return DEFAULT_QUESTIONNAIRES.map(q => ({ ...q }));
    return JSON.parse(raw) as QuestionnaireConfig[];
  } catch {
    return DEFAULT_QUESTIONNAIRES.map(q => ({ ...q }));
  }
}

export function saveQuestionnaires(configs: QuestionnaireConfig[]): void {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(configs));
}

export function resetQuestionnaires(): void {
  localStorage.removeItem(CONFIG_STORAGE_KEY);
}

// ─── Admin auth ───────────────────────────────────────────────────────────────
const ADMIN_KEY = 'cabinet_sommeil_admin_auth';
const DEFAULT_PASSWORD = 'admin1234';

export function getAdminPassword(): string {
  return localStorage.getItem('cabinet_sommeil_admin_pwd') || DEFAULT_PASSWORD;
}

export function setAdminPassword(pwd: string): void {
  localStorage.setItem('cabinet_sommeil_admin_pwd', pwd);
}

export function isAdminAuthenticated(): boolean {
  return localStorage.getItem(ADMIN_KEY) === 'true';
}

export function adminLogin(password: string): boolean {
  if (password === getAdminPassword()) {
    localStorage.setItem(ADMIN_KEY, 'true');
    return true;
  }
  return false;
}

export function adminLogout(): void {
  localStorage.removeItem(ADMIN_KEY);
}

// ─── ID generator ─────────────────────────────────────────────────────────────
export function genId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Storage réponses ─────────────────────────────────────────────────────────
const STORAGE_KEY = 'cabinet_sommeil_reponses';

export function getReponses(): Reponse[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Reponse[]) : [];
  } catch {
    return [];
  }
}

export function saveReponse(r: Omit<Reponse, 'id' | 'createdAt'>): Reponse {
  const reponses = getReponses();
  const newR: Reponse = {
    ...r,
    id: `r_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  reponses.push(newR);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reponses));
  return newR;
}

export function deleteReponse(id: string): void {
  const reponses = getReponses().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reponses));
}

export function exportCSV(): string {
  const reponses = getReponses();
  if (reponses.length === 0) return '';
  const configs = getQuestionnaires();
  const allNoteIds = configs.flatMap((q) =>
    q.domaines.flatMap((d) => d.questionsNotes.map((n) => n.id))
  );
  const header = [
    'ID', 'Poste', 'Questionnaire', 'Date prise de fonction', 'Date complétion', 'Référent',
    ...allNoteIds,
    'Créé le',
  ].join(';');
  const rows = reponses.map((r) => {
    const noteMap = Object.fromEntries(r.notes.map((n) => [n.questionId, n.valeur]));
    return [
      r.id, r.poste, r.questionnaire, r.datePriseDeFonction, r.dateCompletion, r.referent,
      ...allNoteIds.map((id) => noteMap[id] ?? ''),
      r.createdAt,
    ].join(';');
  });
  return [header, ...rows].join('\n');
}

// ─── Stat helpers ─────────────────────────────────────────────────────────────
export function moyenne(vals: number[]): number | null {
  if (vals.length === 0) return null;
  return Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 100) / 100;
}

export function niveauLabel(avg: number | null): { label: string; color: string } {
  if (avg === null) return { label: 'N/A', color: '#9CA3AF' };
  if (avg >= 3.5) return { label: 'Excellent', color: '#16A34A' };
  if (avg >= 3) return { label: 'Bon', color: '#2563EB' };
  if (avg >= 2.5) return { label: 'Moyen', color: '#D97706' };
  return { label: 'À améliorer', color: '#DC2626' };
}
