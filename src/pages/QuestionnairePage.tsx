import { useState, useMemo, useEffect } from 'react';
import {
  POSTES,
  type PosteType,
  type QType,
  type ReponseNote,
  type ReponseOuverte,
  type QuestionnaireConfig,
} from '@/lib/index';
import { fetchConfig, insertReponse } from '@/lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import { springPresets } from '@/lib/motion';
import {
  CheckCircle2, ChevronRight, ChevronLeft, Send, AlertCircle,
  User, Briefcase, Calendar, ClipboardList,
} from 'lucide-react';

// ─── Stepper visuel ───────────────────────────────────────────────────────────
function Stepper({ current }: { current: number }) {
  const steps = ['Identification', 'Informations', 'Questionnaire'];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                done ? 'bg-primary border-primary text-primary-foreground' :
                active ? 'bg-primary/10 border-primary text-primary' :
                'bg-background border-border text-muted-foreground'
              }`}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : <span>{i + 1}</span>}
              </div>
              <span className={`text-[10px] font-semibold whitespace-nowrap hidden sm:block ${active ? 'text-primary' : done ? 'text-foreground' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mt-[-14px] transition-all duration-300 ${done ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1 : Identité + Poste + Questionnaire ────────────────────────────────
function StepChoix({
  nom, setNom, prenom, setPrenom,
  poste, setPoste, qType, setQType, onNext,
}: {
  nom: string; setNom: (v: string) => void;
  prenom: string; setPrenom: (v: string) => void;
  poste: PosteType | ''; setPoste: (p: PosteType) => void;
  qType: QType | ''; setQType: (q: QType) => void;
  onNext: () => void;
}) {
  const QTYPES: { val: QType; label: string; desc: string; color: string }[] = [
    { val: 'post-formation', label: 'Post formation', desc: 'Premières impressions et accueil', color: 'border-blue-300 bg-blue-50 text-blue-700 hover:border-blue-400' },
    { val: '4-6 mois', label: 'Bilan 4-6 mois', desc: 'Intégration complète et perspectives', color: 'border-violet-300 bg-violet-50 text-violet-700 hover:border-violet-400' },
  ];
  const QTYPES_ACTIVE: Record<QType, string> = {
    'post-formation': 'border-blue-500 bg-blue-600 text-white',
    '4-6 mois': 'border-violet-500 bg-violet-600 text-white',
  };

  const canNext = nom.trim() && prenom.trim() && poste && qType;

  return (
    <motion.div
      key="choix"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={springPresets.gentle}
      className="max-w-2xl mx-auto"
    >
      <Stepper current={0} />

      {/* Identité */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-4 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-sm font-bold text-foreground">Identité du collaborateur</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Prénom <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={prenom}
              onChange={e => setPrenom(e.target.value)}
              placeholder="ex : Sophie"
              autoFocus
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Nom <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={nom}
              onChange={e => setNom(e.target.value)}
              placeholder="ex : Martin"
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>
        </div>
      </div>

      {/* Poste */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-4 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-sm font-bold text-foreground">Poste occupé <span className="text-red-500">*</span></h2>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {POSTES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPoste(p)}
              className={`text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-150 flex items-center gap-3 ${
                poste === p
                  ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                  : 'bg-background border-border text-foreground hover:border-primary/50 hover:bg-primary/5'
              }`}
            >
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${poste === p ? 'bg-primary-foreground' : 'bg-border'}`} />
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Questionnaire */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <ClipboardList className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-sm font-bold text-foreground">Étape du bilan <span className="text-red-500">*</span></h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {QTYPES.map(({ val, label, desc, color }) => (
            <button
              key={val}
              type="button"
              onClick={() => setQType(val)}
              className={`rounded-xl border-2 p-4 text-left transition-all duration-150 ${
                qType === val ? QTYPES_ACTIVE[val] : color
              }`}
            >
              <p className={`text-xs font-bold mb-1 ${qType === val ? 'text-white' : ''}`}>{label}</p>
              <p className={`text-[10px] leading-snug ${qType === val ? 'text-white/70' : 'opacity-70'}`}>{desc}</p>
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shadow-sm"
      >
        Continuer <ChevronRight className="w-4 h-4" />
      </button>
      {!canNext && (
        <p className="text-xs text-muted-foreground text-center mt-2">
          Remplissez tous les champs obligatoires pour continuer
        </p>
      )}
    </motion.div>
  );
}

// ─── Step 2 : Informations complémentaires ────────────────────────────────────
function StepIdent({
  datePrise, setDatePrise,
  dateCompletion, setDateCompletion,
  referent, setReferent,
  nom, prenom, poste, qType,
  onNext, onBack,
}: {
  datePrise: string; setDatePrise: (v: string) => void;
  dateCompletion: string; setDateCompletion: (v: string) => void;
  referent: string; setReferent: (v: string) => void;
  nom: string; prenom: string; poste: string; qType: string;
  onNext: () => void; onBack: () => void;
}) {
  return (
    <motion.div
      key="ident"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={springPresets.gentle}
      className="max-w-2xl mx-auto"
    >
      <Stepper current={1} />

      {/* Récap identité */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-xs font-bold text-primary-foreground">
            {prenom.charAt(0).toUpperCase()}{nom.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">{prenom} {nom.toUpperCase()}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">{poste}</span>
            <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-semibold">Bilan {qType}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="ml-auto text-xs text-primary font-semibold hover:underline flex items-center gap-1"
        >
          <ChevronLeft className="w-3 h-3" /> Modifier
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-sm font-bold text-foreground">Informations complémentaires</h2>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Date de prise de poste <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={datePrise}
                onChange={(e) => setDatePrise(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Date de complétion <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dateCompletion}
                onChange={(e) => setDateCompletion(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Responsable référent(e) <span className="text-muted-foreground font-normal">(optionnel)</span>
            </label>
            <input
              type="text"
              value={referent}
              onChange={(e) => setReferent(e.target.value)}
              placeholder="Nom du tuteur / référent"
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!datePrise || !dateCompletion}
        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shadow-sm"
      >
        Commencer le questionnaire <ChevronRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ─── Scale de notation 1-4 ────────────────────────────────────────────────────
const SCALE_ITEMS = [
  { v: 1, short: '1', label: 'Pas du tout satisfait(e)', inactive: 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100', active: 'bg-red-500 border-red-500 text-white shadow-sm' },
  { v: 2, short: '2', label: 'Peu satisfait(e)', inactive: 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100', active: 'bg-orange-500 border-orange-500 text-white shadow-sm' },
  { v: 3, short: '3', label: 'Satisfait(e)', inactive: 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100', active: 'bg-blue-600 border-blue-600 text-white shadow-sm' },
  { v: 4, short: '4', label: 'Très satisfait(e)', inactive: 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100', active: 'bg-green-600 border-green-600 text-white shadow-sm' },
];

function RatingScale({ value, onChange }: { value: number | undefined; onChange: (v: number) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {SCALE_ITEMS.map(({ v, short, label, inactive, active }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`px-2 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all duration-150 flex flex-col items-center gap-1.5 ${value === v ? active : inactive}`}
        >
          <span className="text-lg font-bold leading-none">{short}</span>
          <span className="text-center leading-tight opacity-90 text-[10px]">{label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Step 3 : Questions ───────────────────────────────────────────────────────
function StepQuestions({
  config, poste, nom, prenom,
  notes, setNotes, ouvertes, setOuvertes,
  onSubmit, onBack, submitting,
}: {
  config: QuestionnaireConfig;
  poste: PosteType;
  nom: string; prenom: string;
  notes: Record<string, number>;
  setNotes: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  ouvertes: Record<string, string>;
  setOuvertes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onSubmit: () => void;
  onBack: () => void;
  submitting: boolean;
}) {
  const visibleNoteIds = useMemo(() => {
    return config.domaines.flatMap((d) =>
      d.questionsNotes.filter((q) => !q.postes || q.postes.includes(poste)).map((q) => q.id)
    );
  }, [config, poste]);

  const filled = visibleNoteIds.filter((id) => notes[id] !== undefined).length;
  const progress = visibleNoteIds.length > 0 ? Math.round((filled / visibleNoteIds.length) * 100) : 100;

  const handleNote = (id: string, v: number) => setNotes((prev) => ({ ...prev, [id]: v }));
  const handleOuverte = (id: string, v: string) => setOuvertes((prev) => ({ ...prev, [id]: v }));

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
      <Stepper current={2} />

      {/* Header avec nom + progress */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-4 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-xs font-bold text-primary-foreground">
              {prenom.charAt(0).toUpperCase()}{nom.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">{config.titre}</p>
            <p className="text-xs text-muted-foreground">{prenom} {nom.toUpperCase()} · {poste}</p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Retour
          </button>
        </div>

        {/* Barre de progression */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span className="text-xs font-semibold text-primary whitespace-nowrap">
            {progress}% <span className="text-muted-foreground font-normal">({filled}/{visibleNoteIds.length})</span>
          </span>
        </div>
      </div>

      {/* Consignes */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5">
        <p className="text-xs text-blue-800 font-medium">📋 <strong>Consignes :</strong> {config.consignes}</p>
      </div>

      {/* Domaines */}
      <div className="space-y-4 mb-6">
        {config.domaines.map((d) => {
          const visibleNotes = d.questionsNotes.filter(
            (q) => !q.postes || q.postes.includes(poste)
          );
          if (visibleNotes.length === 0 && d.questionsOuvertes.length === 0) return null;

          return (
            <div key={d.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-muted/60 border-b border-border px-5 py-3.5">
                <h3 className="text-sm font-bold text-foreground">{d.titre}</h3>
              </div>
              <div className="p-5 space-y-5">
                {visibleNotes.map((q) => {
                  qIndex++;
                  return (
                    <div key={q.id}>
                      <div className="flex items-start gap-2 mb-3">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {qIndex}
                        </span>
                        <p className="text-sm text-foreground font-medium leading-snug">{q.label}</p>
                      </div>
                      <RatingScale
                        value={notes[q.id]}
                        onChange={(v) => handleNote(q.id, v)}
                      />
                    </div>
                  );
                })}

                {d.questionsOuvertes.map((q) => {
                  qIndex++;
                  return (
                    <div key={q.id}>
                      <div className="flex items-start gap-2 mb-2">
                        <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {qIndex}
                        </span>
                        <p className="text-sm text-foreground font-medium leading-snug">{q.label}</p>
                      </div>
                      <textarea
                        value={ouvertes[q.id] ?? ''}
                        onChange={(e) => handleOuverte(q.id, e.target.value)}
                        placeholder={q.placeholder || 'Votre réponse...'}
                        rows={3}
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Soumettre */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        {progress < 100 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 mb-4 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span><strong>{visibleNoteIds.length - filled} question{visibleNoteIds.length - filled > 1 ? 's' : ''}</strong> notée{visibleNoteIds.length - filled > 1 ? 's' : ''} sans réponse. Vous pouvez quand même soumettre.</span>
          </div>
        )}
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shadow-sm"
        >
          {submitting ? (
            <><div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" /> Enregistrement…</>
          ) : (
            <><Send className="w-4 h-4" /> Envoyer le questionnaire</>
          )}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Step Done ────────────────────────────────────────────────────────────────
function StepDone({ nom, prenom, qType, onNew }: { nom: string; prenom: string; qType: string; onNew: () => void }) {
  return (
    <motion.div
      key="done"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springPresets.gentle}
      className="max-w-md mx-auto text-center py-12"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ ...springPresets.bouncy, delay: 0.1 }}
        className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </motion.div>
      <h2 className="text-xl font-bold text-foreground mb-2">Questionnaire envoyé !</h2>
      <p className="text-sm text-muted-foreground mb-1">
        Merci <strong>{prenom} {nom.toUpperCase()}</strong>,
      </p>
      <p className="text-sm text-muted-foreground mb-8">
        votre bilan <strong>{qType}</strong> a bien été enregistré et transmis.
      </p>
      <button
        type="button"
        onClick={onNew}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm"
      >
        Remplir un autre questionnaire
      </button>
    </motion.div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function QuestionnairePage() {
  const [step, setStep] = useState<'choix' | 'ident' | 'questions' | 'done'>('choix');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [poste, setPoste] = useState<PosteType | ''>('');
  const [qType, setQType] = useState<QType | ''>('');
  const [datePrise, setDatePrise] = useState('');
  const [dateCompletion, setDateCompletion] = useState(new Date().toISOString().slice(0, 10));
  const [referent, setReferent] = useState('');
  const [notes, setNotes] = useState<Record<string, number>>({});
  const [ouvertes, setOuvertes] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [allConfigs, setAllConfigs] = useState<QuestionnaireConfig[]>([]);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetchConfig()
      .then(data => { if (data && data.length > 0) setAllConfigs(data); })
      .catch(() => {
        // Fallback sur les valeurs par défaut si Supabase échoue
        import('@/lib/index').then(m => setAllConfigs(m.DEFAULT_QUESTIONNAIRES.map(q => JSON.parse(JSON.stringify(q)))));
      });
  }, []);

  const config = useMemo(
    () => allConfigs.find((q) => q.type === qType) ?? null,
    [qType, allConfigs]
  );

  const handleSubmit = async () => {
    if (!poste || !qType || !config) return;
    setSubmitting(true);
    setSubmitError('');

    const notesArr: ReponseNote[] = Object.entries(notes).map(([questionId, valeur]) => ({ questionId, valeur }));
    const ouvertesArr: ReponseOuverte[] = Object.entries(ouvertes)
      .filter(([, texte]) => texte.trim())
      .map(([questionId, texte]) => ({ questionId, texte }));

    try {
      await insertReponse({
        nom,
        prenom,
        poste,
        questionnaire: qType,
        datePriseDeFonction: datePrise,
        dateCompletion,
        referent,
        notes: notesArr,
        ouvertes: ouvertesArr,
      });
      setSubmitting(false);
      setStep('done');
    } catch {
      setSubmitting(false);
      setSubmitError("Erreur lors de l'enregistrement. Vérifiez votre connexion et réessayez.");
    }
  };

  const handleNew = () => {
    setStep('choix');
    setNom(''); setPrenom('');
    setPoste(''); setQType('');
    setDatePrise('');
    setDateCompletion(new Date().toISOString().slice(0, 10));
    setReferent('');
    setNotes({}); setOuvertes({});
    setSubmitError('');
  };

  return (
    <div>
      {submitError && (
        <div className="max-w-2xl mx-auto mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {submitError}
        </div>
      )}
      <AnimatePresence mode="wait">
        {step === 'choix' && (
          <StepChoix
            key="choix"
            nom={nom} setNom={setNom}
            prenom={prenom} setPrenom={setPrenom}
            poste={poste} setPoste={setPoste}
            qType={qType} setQType={setQType}
            onNext={() => setStep('ident')}
          />
        )}
        {step === 'ident' && (
          <StepIdent
            key="ident"
            datePrise={datePrise} setDatePrise={setDatePrise}
            dateCompletion={dateCompletion} setDateCompletion={setDateCompletion}
            referent={referent} setReferent={setReferent}
            nom={nom} prenom={prenom} poste={poste} qType={qType}
            onNext={() => setStep('questions')}
            onBack={() => setStep('choix')}
          />
        )}
        {step === 'questions' && config && poste && (
          <StepQuestions
            key="questions"
            config={config}
            poste={poste as PosteType}
            nom={nom} prenom={prenom}
            notes={notes} setNotes={setNotes}
            ouvertes={ouvertes} setOuvertes={setOuvertes}
            onSubmit={handleSubmit}
            onBack={() => setStep('ident')}
            submitting={submitting}
          />
        )}
        {step === 'done' && (
          <StepDone key="done" nom={nom} prenom={prenom} qType={qType} onNew={handleNew} />
        )}
      </AnimatePresence>
    </div>
  );
}
