import { useState, useMemo } from 'react';
import {
  getQuestionnaires,
  POSTES,
  saveReponse,
  type PosteType,
  type QType,
  type ReponseNote,
  type ReponseOuverte,
  type QuestionnaireConfig,
} from '@/lib/index';
import { motion, AnimatePresence } from 'framer-motion';
import { springPresets } from '@/lib/motion';
import { CheckCircle2, ChevronRight, ChevronLeft, Send, AlertCircle } from 'lucide-react';

// ─── Step 1 : Choix du poste + questionnaire ─────────────────────────────────
function StepChoix({
  poste,
  setPoste,
  qType,
  setQType,
  onNext,
}: {
  poste: PosteType | '';
  setPoste: (p: PosteType) => void;
  qType: QType | '';
  setQType: (q: QType) => void;
  onNext: () => void;
}) {
  const QTYPES: QType[] = ['1 mois', '3 mois', '6 mois'];

  return (
    <motion.div
      key="choix"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={springPresets.gentle}
      className="max-w-xl mx-auto"
    >
      <h2 className="text-lg font-bold text-foreground mb-1">Démarrer un questionnaire</h2>
      <p className="text-sm text-muted-foreground mb-6">Sélectionnez d'abord le poste du collaborateur et le bilan à compléter.</p>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        {/* Poste */}
        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wide mb-3">
            Poste du collaborateur
          </label>
          <div className="grid grid-cols-1 gap-2">
            {POSTES.map((p) => (
              <button
                key={p}
                onClick={() => setPoste(p)}
                className={`text-left px-4 py-3 rounded-lg border text-sm font-medium transition-all duration-150 ${
                  poste === p
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-background border-border text-foreground hover:border-primary/40 hover:bg-muted/50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Questionnaire */}
        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wide mb-3">
            Étape du bilan
          </label>
          <div className="grid grid-cols-3 gap-2">
            {QTYPES.map((q) => (
              <button
                key={q}
                onClick={() => setQType(q)}
                className={`text-center px-3 py-3 rounded-lg border text-sm font-semibold transition-all duration-150 ${
                  qType === q
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-background border-border text-foreground hover:border-primary/40 hover:bg-muted/50'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onNext}
          disabled={!poste || !qType}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
        >
          Continuer <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Step 2 : Identification ──────────────────────────────────────────────────
function StepIdent({
  datePrise,
  setDatePrise,
  dateCompletion,
  setDateCompletion,
  referent,
  setReferent,
  poste,
  qType,
  onNext,
  onBack,
}: {
  datePrise: string;
  setDatePrise: (v: string) => void;
  dateCompletion: string;
  setDateCompletion: (v: string) => void;
  referent: string;
  setReferent: (v: string) => void;
  poste: string;
  qType: string;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <motion.div
      key="ident"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={springPresets.gentle}
      className="max-w-xl mx-auto"
    >
      <div className="flex items-center gap-2 mb-1">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <h2 className="text-lg font-bold text-foreground">Identification</h2>
      </div>
      <div className="flex items-center gap-2 mb-6">
        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-semibold">{poste}</span>
        <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs font-semibold">Bilan {qType}</span>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Date de prise de poste</label>
            <input
              type="date"
              value={datePrise}
              onChange={(e) => setDatePrise(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Date de complétion</label>
            <input
              type="date"
              value={dateCompletion}
              onChange={(e) => setDateCompletion(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Responsable référent(e)</label>
          <input
            type="text"
            value={referent}
            onChange={(e) => setReferent(e.target.value)}
            placeholder="Nom du tuteur / référent"
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <button
          onClick={onNext}
          disabled={!datePrise || !dateCompletion}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
        >
          Commencer le questionnaire <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Scale de notation 1-4 ────────────────────────────────────────────────────
const SCALE_LABELS = ['', 'Pas du tout', 'Peu satisfait(e)', 'Satisfait(e)', 'Très satisfait(e)'];
const SCALE_COLORS = ['', 'bg-red-100 border-red-300 text-red-700', 'bg-orange-100 border-orange-300 text-orange-700', 'bg-blue-100 border-blue-300 text-blue-700', 'bg-green-100 border-green-300 text-green-700'];
const SCALE_ACTIVE = ['', 'bg-red-500 border-red-500 text-white', 'bg-orange-500 border-orange-500 text-white', 'bg-blue-600 border-blue-600 text-white', 'bg-green-600 border-green-600 text-white'];

function RatingScale({
  value,
  onChange,
}: {
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {[1, 2, 3, 4].map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`flex-1 min-w-[4rem] px-2 py-2 rounded-lg border text-xs font-semibold transition-all duration-150 flex flex-col items-center gap-1 ${
            value === v ? SCALE_ACTIVE[v] : SCALE_COLORS[v] + ' hover:opacity-80'
          }`}
        >
          <span className="text-base font-bold">{v}</span>
          <span className="text-center leading-tight opacity-80">{SCALE_LABELS[v]}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Step 3 : Questions ───────────────────────────────────────────────────────
function StepQuestions({
  config,
  poste,
  notes,
  setNotes,
  ouvertes,
  setOuvertes,
  onSubmit,
  onBack,
  submitting,
}: {
  config: QuestionnaireConfig;
  poste: PosteType;
  notes: Record<string, number>;
  setNotes: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  ouvertes: Record<string, string>;
  setOuvertes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onSubmit: () => void;
  onBack: () => void;
  submitting: boolean;
}) {
  // Compter les questions notes visibles pour ce poste
  const visibleNoteIds = useMemo(() => {
    return config.domaines.flatMap((d) =>
      d.questionsNotes
        .filter((q) => !q.postes || q.postes.includes(poste))
        .map((q) => q.id)
    );
  }, [config, poste]);

  const filled = visibleNoteIds.filter((id) => notes[id] !== undefined).length;
  const progress = visibleNoteIds.length > 0 ? Math.round((filled / visibleNoteIds.length) * 100) : 100;

  const handleNote = (id: string, v: number) => {
    setNotes((prev) => ({ ...prev, [id]: v }));
  };

  const handleOuverte = (id: string, v: string) => {
    setOuvertes((prev) => ({ ...prev, [id]: v }));
  };

  let qIndex = 0;

  return (
    <motion.div
      key="questions"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={springPresets.gentle}
      className="max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <h2 className="text-lg font-bold text-foreground">{config.titre}</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1 ml-8">{config.objectif}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3 mb-6 ml-8">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
          {filled}/{visibleNoteIds.length} notées
        </span>
      </div>

      {/* Consignes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6 text-xs text-blue-800">
        <strong className="block mb-0.5">Échelle de notation</strong>
        {config.consignes}
      </div>

      {/* Domaines */}
      <div className="space-y-6">
        {config.domaines.map((domaine, di) => {
          const visibleNotes = domaine.questionsNotes.filter(
            (q) => !q.postes || q.postes.includes(poste)
          );
          if (visibleNotes.length === 0 && domaine.questionsOuvertes.length === 0) return null;

          return (
            <div key={di} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="bg-muted/50 px-5 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">{domaine.titre}</h3>
              </div>

              <div className="p-5 space-y-6">
                {/* Questions notées */}
                {visibleNotes.map((q) => {
                  qIndex += 1;
                  return (
                    <div key={q.id}>
                      <div className="flex items-start gap-2 mb-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center mt-0.5">
                          {qIndex}
                        </span>
                        <p className="text-sm text-foreground leading-relaxed">{q.label}</p>
                        {q.postes && (
                          <span className="flex-shrink-0 text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                            {q.postes.join(' / ')}
                          </span>
                        )}
                      </div>
                      <div className="ml-7">
                        <RatingScale value={notes[q.id]} onChange={(v) => handleNote(q.id, v)} />
                      </div>
                    </div>
                  );
                })}

                {/* Questions ouvertes */}
                {domaine.questionsOuvertes.map((q) => (
                  <div key={q.id}>
                    <div className="flex items-start gap-2 mb-2">
                      <span className="flex-shrink-0 px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 text-[10px] font-bold">
                        Q. ouverte
                      </span>
                      <p className="text-sm text-foreground leading-relaxed">{q.label}</p>
                    </div>
                    <div className="ml-0">
                      <textarea
                        value={ouvertes[q.id] || ''}
                        onChange={(e) => handleOuverte(q.id, e.target.value)}
                        placeholder={q.placeholder}
                        rows={3}
                        className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y placeholder:text-muted-foreground/50"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Missing notes warning */}
      {filled < visibleNoteIds.length && (
        <div className="mt-4 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {visibleNoteIds.length - filled} question(s) notée(s) non renseignée(s). Vous pouvez tout de même soumettre.
        </div>
      )}

      {/* Submit */}
      <button
        onClick={onSubmit}
        disabled={submitting}
        className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {submitting ? (
          'Envoi en cours...'
        ) : (
          <>
            <Send className="w-4 h-4" /> Soumettre le questionnaire
          </>
        )}
      </button>
    </motion.div>
  );
}

// ─── Step 4 : Confirmation ───────────────────────────────────────────────────
function StepDone({ onNew }: { onNew: () => void }) {
  return (
    <motion.div
      key="done"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springPresets.bouncy}
      className="max-w-md mx-auto text-center py-12"
    >
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">Questionnaire enregistré !</h2>
      <p className="text-sm text-muted-foreground mb-8">
        Les réponses ont été sauvegardées. Elles sont maintenant disponibles dans le tableau de bord statistique.
      </p>
      <div className="flex flex-col gap-3">
        <button
          onClick={onNew}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Remplir un autre questionnaire
        </button>
      </div>
    </motion.div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function QuestionnairePage() {
  const [step, setStep] = useState<'choix' | 'ident' | 'questions' | 'done'>('choix');
  const [poste, setPoste] = useState<PosteType | ''>('');
  const [qType, setQType] = useState<QType | ''>('');
  const [datePrise, setDatePrise] = useState('');
  const [dateCompletion, setDateCompletion] = useState(new Date().toISOString().slice(0, 10));
  const [referent, setReferent] = useState('');
  const [notes, setNotes] = useState<Record<string, number>>({});
  const [ouvertes, setOuvertes] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const config = useMemo(
    () => getQuestionnaires().find((q) => q.type === qType) ?? null,
    [qType]
  );

  const handleSubmit = () => {
    if (!poste || !qType || !config) return;
    setSubmitting(true);

    const notesArr: ReponseNote[] = Object.entries(notes).map(([questionId, valeur]) => ({
      questionId,
      valeur,
    }));
    const ouvertesArr: ReponseOuverte[] = Object.entries(ouvertes)
      .filter(([, texte]) => texte.trim())
      .map(([questionId, texte]) => ({ questionId, texte }));

    saveReponse({
      poste,
      questionnaire: qType,
      datePriseDeFonction: datePrise,
      dateCompletion,
      referent,
      notes: notesArr,
      ouvertes: ouvertesArr,
    });

    setTimeout(() => {
      setSubmitting(false);
      setStep('done');
    }, 600);
  };

  const handleNew = () => {
    setStep('choix');
    setPoste('');
    setQType('');
    setDatePrise('');
    setDateCompletion(new Date().toISOString().slice(0, 10));
    setReferent('');
    setNotes({});
    setOuvertes({});
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {step === 'choix' && (
          <StepChoix
            key="choix"
            poste={poste}
            setPoste={setPoste}
            qType={qType}
            setQType={setQType}
            onNext={() => setStep('ident')}
          />
        )}
        {step === 'ident' && (
          <StepIdent
            key="ident"
            datePrise={datePrise}
            setDatePrise={setDatePrise}
            dateCompletion={dateCompletion}
            setDateCompletion={setDateCompletion}
            referent={referent}
            setReferent={setReferent}
            poste={poste}
            qType={qType}
            onNext={() => setStep('questions')}
            onBack={() => setStep('choix')}
          />
        )}
        {step === 'questions' && config && poste && (
          <StepQuestions
            key="questions"
            config={config}
            poste={poste as PosteType}
            notes={notes}
            setNotes={setNotes}
            ouvertes={ouvertes}
            setOuvertes={setOuvertes}
            onSubmit={handleSubmit}
            onBack={() => setStep('ident')}
            submitting={submitting}
          />
        )}
        {step === 'done' && <StepDone key="done" onNew={handleNew} />}
      </AnimatePresence>
    </div>
  );
}
