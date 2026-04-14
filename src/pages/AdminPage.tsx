import { useState, useCallback, useEffect, useRef } from 'react';
import {
  isAdminAuthenticated, adminLogin, adminLogout,
  setAdminPassword, getAdminPassword,
  genId,
  ALL_POSTES_OPTIONS,
  DEFAULT_QUESTIONNAIRES,
  type QuestionnaireConfig, type Domaine, type QuestionNote, type QuestionOuverte, type PosteType, type QType,
} from '@/lib/index';
import { fetchConfig, upsertConfig, resetConfig } from '@/lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import { springPresets } from '@/lib/motion';
import {
  Lock, LogOut, Save, RotateCcw, Plus, Trash2, ChevronUp, ChevronDown,
  Eye, EyeOff, Shield, Edit3, CheckCircle2, X, GripVertical, Settings,
  FileText, ClipboardList, AlertTriangle, KeyRound,
} from 'lucide-react';

// ─── Auth Gate ────────────────────────────────────────────────────────────────
function AuthGate({ onLogin }: { onLogin: () => void }) {
  const [pwd, setPwd] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLogin(pwd)) {
      onLogin();
    } else {
      setError('Mot de passe incorrect.');
      setPwd('');
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={springPresets.gentle}
        className="bg-card border border-border rounded-2xl p-8 w-full max-w-sm shadow-sm"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-sm">
            <Shield className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Espace Administrateur</h1>
          <p className="text-xs text-muted-foreground mt-1 text-center">
            Accès protégé — Entrez votre mot de passe pour continuer
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Mot de passe</label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={pwd}
                onChange={e => { setPwd(e.target.value); setError(''); }}
                placeholder="••••••••"
                autoFocus
                className="w-full px-3 py-2.5 pr-10 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{error}</p>}
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" /> Accéder à l'espace admin
          </button>
        </form>
        <p className="text-[10px] text-muted-foreground text-center mt-4">
          Mot de passe par défaut : <strong>admin1234</strong>
        </p>
      </motion.div>
    </div>
  );
}

// ─── Champ texte inline éditable (stable — ne se démonte pas) ─────────────────
// On utilise une ref pour éviter que le champ perde le focus lors des re-renders du parent.
function InlineEdit({
  value,
  onChange,
  placeholder = '',
  multiline = false,
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
}) {
  // Valeur locale contrôlée par la ref pour éviter les re-renders sauvages
  const [local, setLocal] = useState(value);
  const prevValueRef = useRef(value);

  // Sync uniquement si la valeur externe change depuis l'extérieur (pas pendant la saisie)
  useEffect(() => {
    if (prevValueRef.current !== value) {
      prevValueRef.current = value;
      setLocal(value);
    }
  }, [value]);

  const handleChange = (v: string) => {
    prevValueRef.current = v;
    setLocal(v);
    onChange(v);
  };

  if (multiline) {
    return (
      <textarea
        value={local}
        onChange={e => handleChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className={`w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y ${className}`}
      />
    );
  }
  return (
    <input
      type="text"
      value={local}
      onChange={e => handleChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${className}`}
    />
  );
}

// ─── Sélecteur de postes ──────────────────────────────────────────────────────
function PostesSelector({
  postes,
  onChange,
}: {
  postes: PosteType[] | undefined;
  onChange: (v: PosteType[] | undefined) => void;
}) {
  const isAll = !postes || postes.length === 0;

  return (
    <div className="mt-2">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Postes concernés</p>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className={`px-2 py-1 rounded-full text-[10px] font-semibold border transition-colors ${isAll ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-muted-foreground hover:border-primary/40'}`}
        >
          Tous les postes
        </button>
        {ALL_POSTES_OPTIONS.map(p => {
          const selected = postes?.includes(p);
          return (
            <button
              type="button"
              key={p}
              onClick={() => {
                if (isAll) {
                  onChange([p]);
                } else {
                  const next = selected ? postes!.filter(x => x !== p) : [...(postes || []), p];
                  onChange(next.length === 0 ? undefined : next);
                }
              }}
              className={`px-2 py-1 rounded-full text-[10px] font-semibold border transition-colors ${selected && !isAll ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-muted-foreground hover:border-primary/40'}`}
            >
              {p}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Carte Question Notée ─────────────────────────────────────────────────────
// Mémorisée pour éviter les re-renders inutiles
function QuestionNoteCard({
  q, qIdx, total,
  onChangeLabel, onChangePostes, onDelete, onMove,
}: {
  q: QuestionNote; qIdx: number; total: number;
  onChangeLabel: (id: string, v: string) => void;
  onChangePostes: (id: string, v: PosteType[] | undefined) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, dir: 'up' | 'down') => void;
}) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <div className="flex items-start gap-2 mb-2">
        <GripVertical className="w-4 h-4 text-blue-300 mt-2.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-1 mb-1.5">
            <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Note 1-4</span>
            <span className="text-[10px] text-muted-foreground ml-auto">Q{qIdx + 1}</span>
          </div>
          <InlineEdit
            value={q.label}
            onChange={v => onChangeLabel(q.id, v)}
            placeholder="Libellé de la question..."
            className="bg-white border-blue-200 focus:ring-blue-300"
          />
          <PostesSelector
            postes={q.postes}
            onChange={v => onChangePostes(q.id, v)}
          />
        </div>
        <div className="flex flex-col gap-1 flex-shrink-0">
          <button type="button" onClick={() => onMove(q.id, 'up')} disabled={qIdx === 0} className="p-1 rounded hover:bg-blue-100 disabled:opacity-30 transition-colors">
            <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
          </button>
          <button type="button" onClick={() => onMove(q.id, 'down')} disabled={qIdx === total - 1} className="p-1 rounded hover:bg-blue-100 disabled:opacity-30 transition-colors">
            <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
          </button>
          <button type="button" onClick={() => onDelete(q.id)} className="p-1 rounded hover:bg-red-100 transition-colors">
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Carte Question Ouverte ───────────────────────────────────────────────────
function QuestionOuverteCard({
  q, qIdx, total,
  onChangeLabel, onChangePlaceholder, onDelete, onMove,
}: {
  q: QuestionOuverte; qIdx: number; total: number;
  onChangeLabel: (id: string, v: string) => void;
  onChangePlaceholder: (id: string, v: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, dir: 'up' | 'down') => void;
}) {
  return (
    <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
      <div className="flex items-start gap-2 mb-2">
        <GripVertical className="w-4 h-4 text-violet-300 mt-2.5 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">Question ouverte</span>
            <span className="text-[10px] text-muted-foreground ml-auto">Q{qIdx + 1}</span>
          </div>
          <InlineEdit
            value={q.label}
            onChange={v => onChangeLabel(q.id, v)}
            placeholder="Libellé de la question ouverte..."
            multiline
            className="bg-white border-violet-200 focus:ring-violet-300"
          />
          <InlineEdit
            value={q.placeholder}
            onChange={v => onChangePlaceholder(q.id, v)}
            placeholder="Texte d'aide (placeholder)..."
            className="bg-white border-violet-100 text-xs text-muted-foreground focus:ring-violet-300"
          />
        </div>
        <div className="flex flex-col gap-1 flex-shrink-0">
          <button type="button" onClick={() => onMove(q.id, 'up')} disabled={qIdx === 0} className="p-1 rounded hover:bg-violet-100 disabled:opacity-30 transition-colors">
            <ChevronUp className="w-3.5 h-3.5 text-violet-600" />
          </button>
          <button type="button" onClick={() => onMove(q.id, 'down')} disabled={qIdx === total - 1} className="p-1 rounded hover:bg-violet-100 disabled:opacity-30 transition-colors">
            <ChevronDown className="w-3.5 h-3.5 text-violet-600" />
          </button>
          <button type="button" onClick={() => onDelete(q.id)} className="p-1 rounded hover:bg-red-100 transition-colors">
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Carte Domaine ─────────────────────────────────────────────────────────────
function DomaineCard({
  d, dIdx, totalDomaines,
  onChangeTitre,
  onNoteChangeLabel, onNoteChangePostes, onNoteDelete, onNoteMove, onNoteAdd,
  onOuverteChangeLabel, onOuverteChangePlaceholder, onOuverteDelete, onOuverteMove, onOuverteAdd,
  onDelete, onMove,
}: {
  d: Domaine; dIdx: number; totalDomaines: number;
  onChangeTitre: (id: string, v: string) => void;
  onNoteChangeLabel: (domaineId: string, questionId: string, v: string) => void;
  onNoteChangePostes: (domaineId: string, questionId: string, v: PosteType[] | undefined) => void;
  onNoteDelete: (domaineId: string, questionId: string) => void;
  onNoteMove: (domaineId: string, questionId: string, dir: 'up' | 'down') => void;
  onNoteAdd: (domaineId: string) => void;
  onOuverteChangeLabel: (domaineId: string, questionId: string, v: string) => void;
  onOuverteChangePlaceholder: (domaineId: string, questionId: string, v: string) => void;
  onOuverteDelete: (domaineId: string, questionId: string) => void;
  onOuverteMove: (domaineId: string, questionId: string, dir: 'up' | 'down') => void;
  onOuverteAdd: (domaineId: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, dir: 'up' | 'down') => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* Header domaine */}
      <div className="flex items-center gap-2 px-5 py-3 bg-muted/40 border-b border-border">
        <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <div className="flex-1">
          <InlineEdit
            value={d.titre}
            onChange={v => onChangeTitre(d.id, v)}
            placeholder="Titre du domaine..."
            className="font-semibold text-sm bg-transparent border-muted focus:bg-background"
          />
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-[10px] text-muted-foreground">{d.questionsNotes.length + d.questionsOuvertes.length} question(s)</span>
          <button type="button" onClick={() => onMove(d.id, 'up')} disabled={dIdx === 0} className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors">
            <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button type="button" onClick={() => onMove(d.id, 'down')} disabled={dIdx === totalDomaines - 1} className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors">
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button type="button" onClick={() => setCollapsed(c => !c)} className="p-1 rounded hover:bg-muted transition-colors">
            {collapsed ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
          <button type="button" onClick={() => onDelete(d.id)} className="p-1 rounded hover:bg-red-50 transition-colors ml-1">
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </button>
        </div>
      </div>

      {/* Body domaine */}
      {!collapsed && (
        <div className="p-5 space-y-6">
          {/* Questions notées */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Questions notées (1-4)</p>
              <button
                type="button"
                onClick={() => onNoteAdd(d.id)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Ajouter
              </button>
            </div>
            {d.questionsNotes.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-2">Aucune question notée dans ce domaine.</p>
            ) : (
              <div className="space-y-3">
                {d.questionsNotes.map((q, qi) => (
                  <QuestionNoteCard
                    key={q.id}
                    q={q} qIdx={qi} total={d.questionsNotes.length}
                    onChangeLabel={(qId, v) => onNoteChangeLabel(d.id, qId, v)}
                    onChangePostes={(qId, v) => onNoteChangePostes(d.id, qId, v)}
                    onDelete={(qId) => onNoteDelete(d.id, qId)}
                    onMove={(qId, dir) => onNoteMove(d.id, qId, dir)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Questions ouvertes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide">Questions ouvertes</p>
              <button
                type="button"
                onClick={() => onOuverteAdd(d.id)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold hover:bg-violet-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Ajouter
              </button>
            </div>
            {d.questionsOuvertes.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-2">Aucune question ouverte dans ce domaine.</p>
            ) : (
              <div className="space-y-3">
                {d.questionsOuvertes.map((q, qi) => (
                  <QuestionOuverteCard
                    key={q.id}
                    q={q} qIdx={qi} total={d.questionsOuvertes.length}
                    onChangeLabel={(qId, v) => onOuverteChangeLabel(d.id, qId, v)}
                    onChangePlaceholder={(qId, v) => onOuverteChangePlaceholder(d.id, qId, v)}
                    onDelete={(qId) => onOuverteDelete(d.id, qId)}
                    onMove={(qId, dir) => onOuverteMove(d.id, qId, dir)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section Mot de passe ─────────────────────────────────────────────────────
function PwdSection() {
  const [current, setCurrent] = useState('');
  const [next1, setNext1] = useState('');
  const [next2, setNext2] = useState('');
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleSave = () => {
    if (current !== getAdminPassword()) {
      setMsg({ type: 'err', text: 'Mot de passe actuel incorrect.' });
      return;
    }
    if (next1.length < 6) {
      setMsg({ type: 'err', text: 'Le nouveau mot de passe doit faire au moins 6 caractères.' });
      return;
    }
    if (next1 !== next2) {
      setMsg({ type: 'err', text: 'Les deux mots de passe ne correspondent pas.' });
      return;
    }
    setAdminPassword(next1);
    setCurrent(''); setNext1(''); setNext2('');
    setMsg({ type: 'ok', text: 'Mot de passe modifié avec succès.' });
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 max-w-sm">
      <div className="flex items-center gap-2 mb-4">
        <KeyRound className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Modifier le mot de passe admin</h3>
      </div>
      <div className="space-y-3">
        {([
          ['Mot de passe actuel', current, setCurrent],
          ['Nouveau mot de passe', next1, setNext1],
          ['Confirmer le nouveau mot de passe', next2, setNext2],
        ] as [string, string, (v: string) => void][]).map(([label, val, setter]) => (
          <div key={label}>
            <label className="block text-xs font-semibold text-foreground mb-1">{label}</label>
            <input
              type="password"
              value={val}
              onChange={e => { setter(e.target.value); setMsg(null); }}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        ))}
        {msg && (
          <p className={`text-xs flex items-center gap-1.5 ${msg.type === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
            {msg.type === 'ok' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
            {msg.text}
          </p>
        )}
        <button
          type="button"
          onClick={handleSave}
          className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Enregistrer le nouveau mot de passe
        </button>
      </div>
    </div>
  );
}

// ─── Éditeur de questionnaire (props stables passées depuis AdminPage) ─────────
function QuestionnaireEditor({
  config,
  onChangeTitre,
  onChangeObjectif,
  onChangeConsignes,
  onDomaineTitreChange,
  onNoteChangeLabel,
  onNoteChangePostes,
  onNoteDelete,
  onNoteMove,
  onNoteAdd,
  onOuverteChangeLabel,
  onOuverteChangePlaceholder,
  onOuverteDelete,
  onOuverteMove,
  onOuverteAdd,
  onDomaineDelete,
  onDomaineMove,
  onDomaineAdd,
}: {
  config: QuestionnaireConfig;
  onChangeTitre: (v: string) => void;
  onChangeObjectif: (v: string) => void;
  onChangeConsignes: (v: string) => void;
  onDomaineTitreChange: (domaineId: string, v: string) => void;
  onNoteChangeLabel: (domaineId: string, questionId: string, v: string) => void;
  onNoteChangePostes: (domaineId: string, questionId: string, v: PosteType[] | undefined) => void;
  onNoteDelete: (domaineId: string, questionId: string) => void;
  onNoteMove: (domaineId: string, questionId: string, dir: 'up' | 'down') => void;
  onNoteAdd: (domaineId: string) => void;
  onOuverteChangeLabel: (domaineId: string, questionId: string, v: string) => void;
  onOuverteChangePlaceholder: (domaineId: string, questionId: string, v: string) => void;
  onOuverteDelete: (domaineId: string, questionId: string) => void;
  onOuverteMove: (domaineId: string, questionId: string, dir: 'up' | 'down') => void;
  onOuverteAdd: (domaineId: string) => void;
  onDomaineDelete: (domaineId: string) => void;
  onDomaineMove: (domaineId: string, dir: 'up' | 'down') => void;
  onDomaineAdd: () => void;
}) {
  const LABEL_MAP: Record<QType, string> = { 'post-formation': 'Post formation', '4-6 mois': 'Bilan 4-6 mois' };
  const COLOR_MAP: Record<QType, string> = { 'post-formation': 'bg-blue-600', '4-6 mois': 'bg-violet-600' };

  return (
    <div className="space-y-5">
      {/* Informations générales */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className={`flex items-center gap-3 px-5 py-4 ${COLOR_MAP[config.type]}`}>
          <FileText className="w-5 h-5 text-white flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-white/70 uppercase tracking-widest">Questionnaire</p>
            <p className="text-base font-bold text-white">{LABEL_MAP[config.type]}</p>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Titre du questionnaire</label>
            <InlineEdit
              value={config.titre}
              onChange={onChangeTitre}
              placeholder="Titre..."
              className="font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Objectif</label>
            <InlineEdit
              value={config.objectif}
              onChange={onChangeObjectif}
              placeholder="Objectif du questionnaire..."
              multiline
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Consignes de notation</label>
            <InlineEdit
              value={config.consignes}
              onChange={onChangeConsignes}
              placeholder="Explication de l'échelle 1-4..."
            />
          </div>
        </div>
      </div>

      {/* Domaines */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">
            Domaines ({config.domaines.length})
          </h3>
          <button
            type="button"
            onClick={onDomaineAdd}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Ajouter un domaine
          </button>
        </div>
        <div className="space-y-4">
          {config.domaines.map((d, di) => (
            <DomaineCard
              key={d.id}
              d={d} dIdx={di} totalDomaines={config.domaines.length}
              onChangeTitre={onDomaineTitreChange}
              onNoteChangeLabel={onNoteChangeLabel}
              onNoteChangePostes={onNoteChangePostes}
              onNoteDelete={onNoteDelete}
              onNoteMove={onNoteMove}
              onNoteAdd={onNoteAdd}
              onOuverteChangeLabel={onOuverteChangeLabel}
              onOuverteChangePlaceholder={onOuverteChangePlaceholder}
              onOuverteDelete={onOuverteDelete}
              onOuverteMove={onOuverteMove}
              onOuverteAdd={onOuverteAdd}
              onDelete={onDomaineDelete}
              onMove={onDomaineMove}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page Admin principale ────────────────────────────────────────────────────
type AdminTab = 'questionnaires' | 'parametres';

export default function AdminPage() {
  const [authed, setAuthed] = useState(isAdminAuthenticated());
  const [configs, setConfigs] = useState<QuestionnaireConfig[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [saveError, setSaveError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('questionnaires');
  const [activeQ, setActiveQ] = useState<QType>('post-formation');
  const [saved, setSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (!authed) return;
    fetchConfig()
      .then(setConfigs)
      .catch(() => setConfigs(DEFAULT_QUESTIONNAIRES.map(q => JSON.parse(JSON.stringify(q)))))
      .finally(() => setLoadingConfig(false));
  }, [authed]);

  const handleSave = useCallback(async () => {
    setSaveError('');
    try {
      await upsertConfig(configs);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaveError('Erreur lors de la sauvegarde. Vérifiez votre connexion.');
    }
  }, [configs]);

  const handleReset = async () => {
    try {
      await resetConfig();
      setConfigs(DEFAULT_QUESTIONNAIRES.map(q => JSON.parse(JSON.stringify(q))));
      setShowResetConfirm(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaveError('Erreur lors de la réinitialisation.');
    }
  };

  const handleLogout = () => { adminLogout(); setAuthed(false); };

  // ── activeQRef : permet aux callbacks de lire activeQ sans en dépendre ──────
  const activeQRef = useRef<QType>(activeQ);
  useEffect(() => { activeQRef.current = activeQ; }, [activeQ]);

  // ── Mutation centrale — TOUJOURS stable (pas de dépendances variables) ───────
  const mutateConfig = useCallback((fn: (c: QuestionnaireConfig) => QuestionnaireConfig) => {
    setConfigs(prev => prev.map(c => c.type === activeQRef.current ? fn(c) : c));
  }, []);

  // Titre / objectif / consignes
  const onChangeTitre      = useCallback((v: string) => mutateConfig(c => ({ ...c, titre: v })), [mutateConfig]);
  const onChangeObjectif   = useCallback((v: string) => mutateConfig(c => ({ ...c, objectif: v })), [mutateConfig]);
  const onChangeConsignes  = useCallback((v: string) => mutateConfig(c => ({ ...c, consignes: v })), [mutateConfig]);

  // Domaine
  const onDomaineTitreChange = useCallback((domaineId: string, v: string) => {
    mutateConfig(c => ({
      ...c,
      domaines: c.domaines.map(d => d.id === domaineId ? { ...d, titre: v } : d),
    }));
  }, [mutateConfig]);

  const onDomaineDelete = useCallback((domaineId: string) => {
    mutateConfig(c => ({ ...c, domaines: c.domaines.filter(d => d.id !== domaineId) }));
  }, [mutateConfig]);

  const onDomaineMove = useCallback((domaineId: string, dir: 'up' | 'down') => {
    mutateConfig(c => {
      const next = [...c.domaines];
      const idx = next.findIndex(d => d.id === domaineId);
      if (idx < 0) return c;
      const target = dir === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= next.length) return c;
      [next[idx], next[target]] = [next[target], next[idx]];
      return { ...c, domaines: next };
    });
  }, [mutateConfig]);

  const onDomaineAdd = useCallback(() => {
    mutateConfig(c => ({
      ...c,
      domaines: [...c.domaines, { id: genId('d'), titre: 'Nouveau domaine', questionsNotes: [], questionsOuvertes: [] }],
    }));
  }, [mutateConfig]);

  // Questions notées
  const onNoteChangeLabel = useCallback((domaineId: string, questionId: string, v: string) => {
    mutateConfig(c => ({
      ...c,
      domaines: c.domaines.map(d => d.id !== domaineId ? d : {
        ...d,
        questionsNotes: d.questionsNotes.map(q => q.id === questionId ? { ...q, label: v } : q),
      }),
    }));
  }, [mutateConfig]);

  const onNoteChangePostes = useCallback((domaineId: string, questionId: string, v: PosteType[] | undefined) => {
    mutateConfig(c => ({
      ...c,
      domaines: c.domaines.map(d => d.id !== domaineId ? d : {
        ...d,
        questionsNotes: d.questionsNotes.map(q => q.id === questionId ? { ...q, postes: v } : q),
      }),
    }));
  }, [mutateConfig]);

  const onNoteDelete = useCallback((domaineId: string, questionId: string) => {
    mutateConfig(c => ({
      ...c,
      domaines: c.domaines.map(d => d.id !== domaineId ? d : {
        ...d,
        questionsNotes: d.questionsNotes.filter(q => q.id !== questionId),
      }),
    }));
  }, [mutateConfig]);

  const onNoteMove = useCallback((domaineId: string, questionId: string, dir: 'up' | 'down') => {
    mutateConfig(c => ({
      ...c,
      domaines: c.domaines.map(d => {
        if (d.id !== domaineId) return d;
        const next = [...d.questionsNotes];
        const idx = next.findIndex(q => q.id === questionId);
        if (idx < 0) return d;
        const target = dir === 'up' ? idx - 1 : idx + 1;
        if (target < 0 || target >= next.length) return d;
        [next[idx], next[target]] = [next[target], next[idx]];
        return { ...d, questionsNotes: next };
      }),
    }));
  }, [mutateConfig]);

  const onNoteAdd = useCallback((domaineId: string) => {
    mutateConfig(c => ({
      ...c,
      domaines: c.domaines.map(d => d.id !== domaineId ? d : {
        ...d,
        questionsNotes: [...d.questionsNotes, { id: genId('qn'), label: '', postes: undefined }],
      }),
    }));
  }, [mutateConfig]);

  // Questions ouvertes
  const onOuverteChangeLabel = useCallback((domaineId: string, questionId: string, v: string) => {
    mutateConfig(c => ({
      ...c,
      domaines: c.domaines.map(d => d.id !== domaineId ? d : {
        ...d,
        questionsOuvertes: d.questionsOuvertes.map(q => q.id === questionId ? { ...q, label: v } : q),
      }),
    }));
  }, [mutateConfig]);

  const onOuverteChangePlaceholder = useCallback((domaineId: string, questionId: string, v: string) => {
    mutateConfig(c => ({
      ...c,
      domaines: c.domaines.map(d => d.id !== domaineId ? d : {
        ...d,
        questionsOuvertes: d.questionsOuvertes.map(q => q.id === questionId ? { ...q, placeholder: v } : q),
      }),
    }));
  }, [mutateConfig]);

  const onOuverteDelete = useCallback((domaineId: string, questionId: string) => {
    mutateConfig(c => ({
      ...c,
      domaines: c.domaines.map(d => d.id !== domaineId ? d : {
        ...d,
        questionsOuvertes: d.questionsOuvertes.filter(q => q.id !== questionId),
      }),
    }));
  }, [mutateConfig]);

  const onOuverteMove = useCallback((domaineId: string, questionId: string, dir: 'up' | 'down') => {
    mutateConfig(c => ({
      ...c,
      domaines: c.domaines.map(d => {
        if (d.id !== domaineId) return d;
        const next = [...d.questionsOuvertes];
        const idx = next.findIndex(q => q.id === questionId);
        if (idx < 0) return d;
        const target = dir === 'up' ? idx - 1 : idx + 1;
        if (target < 0 || target >= next.length) return d;
        [next[idx], next[target]] = [next[target], next[idx]];
        return { ...d, questionsOuvertes: next };
      }),
    }));
  }, [mutateConfig]);

  const onOuverteAdd = useCallback((domaineId: string) => {
    mutateConfig(c => ({
      ...c,
      domaines: c.domaines.map(d => d.id !== domaineId ? d : {
        ...d,
        questionsOuvertes: [...d.questionsOuvertes, { id: genId('qo'), label: '', placeholder: '' }],
      }),
    }));
  }, [mutateConfig]);

  if (!authed) return <AuthGate onLogin={() => setAuthed(true)} />;
  if (loadingConfig) return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Chargement de la configuration…</p>
      </div>
    </div>
  );

  const currentConfig = configs.find(c => c.type === activeQ)!;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springPresets.gentle}
    >
      {/* Header admin */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm flex-shrink-0">
            <Settings className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Espace Administrateur</h1>
            <p className="text-xs text-muted-foreground">Gérez et personnalisez tous les questionnaires</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {saved && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-3 py-2 rounded-lg"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Modifications enregistrées
            </motion.span>
          )}
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Réinitialiser
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Save className="w-3.5 h-3.5" /> Enregistrer les modifications
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Déconnexion
          </button>
        </div>
      </div>

      {/* Erreur sauvegarde */}
      {saveError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl mb-4">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {saveError}
          <button type="button" onClick={() => setSaveError('')} className="ml-auto font-bold">✕</button>
        </div>
      )}

      {/* Confirm reset modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={springPresets.gentle}
              className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Réinitialiser les questionnaires ?</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Toutes vos modifications seront perdues et remplacées par la version par défaut.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2.5 border border-border rounded-lg text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors"
                >
                  Réinitialiser
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs admin */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6 w-fit">
        {([
          { id: 'questionnaires', label: 'Questionnaires', icon: ClipboardList },
          { id: 'parametres', label: 'Paramètres', icon: Settings },
        ] as { id: AdminTab; label: string; icon: React.ElementType }[]).map(t => (
          <button
            type="button"
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
              activeTab === t.id
                ? 'bg-background text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Onglet Questionnaires ─────────────────────────── */}
      {activeTab === 'questionnaires' && (
        <div>
          {/* Sélecteur de questionnaire */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(['post-formation', '4-6 mois'] as QType[]).map((qt, i) => {
              const cfg = configs.find(c => c.type === qt)!;
              const totalQ = cfg.domaines.reduce((s, d) => s + d.questionsNotes.length + d.questionsOuvertes.length, 0);
              const colors = ['border-blue-300 bg-blue-50 text-blue-700', 'border-violet-300 bg-violet-50 text-violet-700'];
              const activeColors = ['border-blue-500 bg-blue-600 text-white', 'border-violet-500 bg-violet-600 text-white'];
              const isActive = activeQ === qt;
              return (
                <button
                  type="button"
                  key={qt}
                  onClick={() => setActiveQ(qt)}
                  className={`rounded-xl border-2 p-4 text-left transition-all duration-150 ${isActive ? activeColors[i] : colors[i] + ' hover:border-opacity-70'}`}
                >
                  <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isActive ? 'text-white/70' : 'opacity-60'}`}>Bilan</p>
                  <p className="text-base font-bold leading-tight">{qt}</p>
                  <p className={`text-[10px] mt-1.5 ${isActive ? 'text-white/70' : 'opacity-60'}`}>
                    {cfg.domaines.length} domaine{cfg.domaines.length > 1 ? 's' : ''} · {totalQ} question{totalQ > 1 ? 's' : ''}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Info banner */}
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-xs text-amber-800">
            <Edit3 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Toutes les modifications sont appliquées en temps réel. Cliquez sur <strong>Enregistrer les modifications</strong> pour les rendre permanentes.</span>
          </div>

          {/* Éditeur */}
          {currentConfig && (
            <QuestionnaireEditor
              config={currentConfig}
              onChangeTitre={onChangeTitre}
              onChangeObjectif={onChangeObjectif}
              onChangeConsignes={onChangeConsignes}
              onDomaineTitreChange={onDomaineTitreChange}
              onNoteChangeLabel={onNoteChangeLabel}
              onNoteChangePostes={onNoteChangePostes}
              onNoteDelete={onNoteDelete}
              onNoteMove={onNoteMove}
              onNoteAdd={onNoteAdd}
              onOuverteChangeLabel={onOuverteChangeLabel}
              onOuverteChangePlaceholder={onOuverteChangePlaceholder}
              onOuverteDelete={onOuverteDelete}
              onOuverteMove={onOuverteMove}
              onOuverteAdd={onOuverteAdd}
              onDomaineDelete={onDomaineDelete}
              onDomaineMove={onDomaineMove}
              onDomaineAdd={onDomaineAdd}
            />
          )}
        </div>
      )}

      {/* ── Onglet Paramètres ─────────────────────────────── */}
      {activeTab === 'parametres' && (
        <div className="space-y-6">
          <PwdSection />

          {/* Récapitulatif structure */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Structure des questionnaires</h3>
            </div>
            <div className="space-y-3">
              {configs.map(c => {
                const totalN = c.domaines.reduce((s, d) => s + d.questionsNotes.length, 0);
                const totalO = c.domaines.reduce((s, d) => s + d.questionsOuvertes.length, 0);
                return (
                  <div key={c.type} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                    <span className="text-xs font-bold text-primary w-16">Bilan {c.type}</span>
                    <span className="text-xs text-muted-foreground flex-1 truncate">{c.titre}</span>
                    <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{c.domaines.length} domaines</span>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{totalN} notées</span>
                    <span className="text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">{totalO} ouvertes</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
