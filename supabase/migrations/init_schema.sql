
-- ── Table des réponses aux questionnaires ──────────────────────────────────
CREATE TABLE IF NOT EXISTS reponses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poste TEXT NOT NULL,
  questionnaire TEXT NOT NULL CHECK (questionnaire IN ('1 mois', '3 mois', '6 mois')),
  date_prise_de_fonction TEXT,
  date_completion TEXT,
  referent TEXT,
  notes JSONB NOT NULL DEFAULT '[]',
  ouvertes JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sécurité : accès libre (outil interne cabinet, pas d'authentification utilisateur)
ALTER TABLE reponses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_reponses" ON reponses FOR ALL USING (true) WITH CHECK (true);

-- ── Table de configuration des questionnaires (admin) ──────────────────────
CREATE TABLE IF NOT EXISTS questionnaire_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  config JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE questionnaire_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_config" ON questionnaire_config FOR ALL USING (true) WITH CHECK (true);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_reponses_poste ON reponses(poste);
CREATE INDEX IF NOT EXISTS idx_reponses_questionnaire ON reponses(questionnaire);
CREATE INDEX IF NOT EXISTS idx_reponses_created_at ON reponses(created_at DESC);
