import { useState, useCallback, useEffect, useRef } from 'react';
import {
  isAdminAuthenticated, adminLogin, adminLogout,
  setAdminPassword, getAdminPassword,
  genId, moyenne, niveauLabel, POSTES,
  ALL_POSTES_OPTIONS,
  DEFAULT_QUESTIONNAIRES,
  type QuestionnaireConfig, type Domaine, type QuestionNote, type QuestionOuverte,
  type PosteType, type QType, type Reponse,
} from '@/lib/index';
import { fetchConfig, upsertConfig, resetConfig, fetchReponses, removeReponse, exportCSVFromDb } from '@/lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import { springPresets } from '@/lib/motion';
import {
  Lock, LogOut, Save, RotateCcw, Plus, Trash2, ChevronUp, ChevronDown,
  Eye, EyeOff, Shield, Edit3, CheckCircle2, X, GripVertical, Settings,
  FileText, ClipboardList, AlertTriangle, KeyRound, BarChart2, Download, RefreshCw,
  Users, Loader2, ChevronRight, MessageSquare, Star, Printer,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';

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

type AdminTab = 'dashboard' | 'questionnaires' | 'parametres';

// ─── Onglet Dashboard ────────────────────────────────────────────────────────
const QTYPES_DASH: QType[] = ['post-formation', '4-6 mois'];
const COLORS_DASH: Record<QType, string> = { 'post-formation': '#3B82F6', '4-6 mois': '#8B5CF6' };
const LABELS_DASH: Record<QType, string> = { 'post-formation': 'Post formation', '4-6 mois': 'Bilan 4-6 mois' };
const COLORS_POSTE = ['#2563EB', '#0D9488', '#7C3AED', '#D97706', '#DC2626'];

function NiveauBadge({ avg }: { avg: number | null }) {
  const { label, color } = niveauLabel(avg);
  const bg = avg === null ? 'bg-gray-100 text-gray-500'
    : avg >= 3.5 ? 'bg-green-100 text-green-700'
    : avg >= 3   ? 'bg-blue-100 text-blue-700'
    : avg >= 2.5 ? 'bg-orange-100 text-orange-700'
    : 'bg-red-100 text-red-700';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${bg}`} style={{ color }}>{label}{avg !== null ? ` (${avg.toFixed(2)})` : ''}</span>;
}

// ─── Génération PDF compte rendu ──────────────────────────────────────────────
function generatePDF(reponse: Reponse, configs: QuestionnaireConfig[]) {
  const cfg = configs.find(c => c.type === reponse.questionnaire)
    ?? DEFAULT_QUESTIONNAIRES.find(c => c.type === reponse.questionnaire);
  const avg = moyenne(reponse.notes.map(n => n.valeur));
  const { label: niveauLbl } = niveauLabel(avg);

  const noteColors: Record<number, string> = {
    4: '#16a34a', 3: '#2563eb', 2: '#ea580c', 1: '#dc2626',
  };
  const noteLabels: Record<number, string> = {
    4: 'Très satisfait(e)', 3: 'Satisfait(e)', 2: 'Peu satisfait(e)', 1: 'Pas satisfait(e)',
  };

  const domainesHTML = cfg ? cfg.domaines.map(domaine => {
    const domNotes = domaine.questionsNotes
      .map(q => ({ q, r: reponse.notes.find(n => n.questionId === q.id) }))
      .filter(({ r }) => r !== undefined);
    const domOuvertes = domaine.questionsOuvertes
      .map(q => ({ q, r: reponse.ouvertes.find(o => o.questionId === q.id) }))
      .filter(({ r }) => r?.texte);
    if (domNotes.length === 0 && domOuvertes.length === 0) return '';

    const notesHTML = domNotes.map(({ q, r }) => `
      <div class="question-note">
        <div class="question-label">${q.label}</div>
        <div class="note-badge" style="background:${noteColors[r!.valeur] ?? '#6b7280'}">
          ${r!.valeur}/4 — ${noteLabels[r!.valeur] ?? ''}
        </div>
      </div>
    `).join('');

    const ouvertesHTML = domOuvertes.map(({ q, r }) => `
      <div class="question-ouverte">
        <div class="question-label-open">${q.label}</div>
        <div class="reponse-texte">« ${r!.texte} »</div>
      </div>
    `).join('');

    return `
      <div class="domaine">
        <h3 class="domaine-titre">${domaine.titre}</h3>
        ${notesHTML}
        ${ouvertesHTML}
      </div>
    `;
  }).join('') : '';

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>Compte rendu — ${reponse.prenom} ${(reponse.nom||'').toUpperCase()}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #1a1a2e; background: #fff; }
    .page { max-width: 780px; margin: 0 auto; padding: 32px 40px; }

    /* En-tête */
    .header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 18px; border-bottom: 2px solid #1e3a5f; margin-bottom: 24px; }
    .header-left h1 { font-size: 20px; font-weight: 800; color: #1e3a5f; letter-spacing: -0.5px; }
    .header-left p { font-size: 11px; color: #64748b; margin-top: 3px; }
    .header-right { text-align: right; }
    .avg-big { font-size: 36px; font-weight: 900; color: #1e3a5f; line-height: 1; }
    .avg-label { font-size: 10px; color: #64748b; margin-top: 2px; }
    .niveau-badge { display: inline-block; margin-top: 4px; padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 700;
      background: ${avg !== null && avg >= 3.5 ? '#dcfce7' : avg !== null && avg >= 3 ? '#dbeafe' : avg !== null && avg >= 2.5 ? '#ffedd5' : '#fee2e2'};
      color: ${avg !== null && avg >= 3.5 ? '#166534' : avg !== null && avg >= 3 ? '#1d4ed8' : avg !== null && avg >= 2.5 ? '#9a3412' : '#991b1b'};
    }

    /* Fiche identité */
    .identity { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 24px; }
    .identity-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; }
    .identity-item .lbl { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; margin-bottom: 3px; }
    .identity-item .val { font-size: 11px; font-weight: 600; color: #1e293b; }

    /* Domaines */
    .domaine { margin-bottom: 22px; break-inside: avoid; }
    .domaine-titre { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; color: #1e3a5f;
      padding: 7px 12px; background: #f1f5f9; border-left: 3px solid #1e3a5f; border-radius: 0 6px 6px 0; margin-bottom: 10px; }

    .question-note { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
      padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 7px; margin-bottom: 6px; background: #fff; }
    .question-label { flex: 1; font-size: 10.5px; color: #334155; line-height: 1.4; }
    .note-badge { flex-shrink: 0; padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; color: #fff; white-space: nowrap; }

    .question-ouverte { padding: 10px 14px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 7px; margin-bottom: 6px; }
    .question-label-open { font-size: 10px; font-weight: 700; color: #1d4ed8; margin-bottom: 5px; line-height: 1.4; }
    .reponse-texte { font-size: 10.5px; color: #1e293b; line-height: 1.6; font-style: italic; padding-left: 8px; border-left: 2px solid #93c5fd; }

    /* Pied de page */
    .footer { margin-top: 32px; padding-top: 14px; border-top: 1px solid #e2e8f0;
      display: flex; justify-content: space-between; align-items: center; }
    .footer p { font-size: 9px; color: #94a3b8; }

    /* Section titre */
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
      color: #64748b; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
    .section-title::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { padding: 20px 28px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- En-tête -->
    <div class="header">
      <div class="header-left">
        <h1>Compte rendu d'intégration</h1>
        <p>Centre de Médecine du Sommeil · Document confidentiel</p>
      </div>
      <div class="header-right">
        <div class="avg-big">${avg !== null ? avg.toFixed(2) : '—'}<span style="font-size:16px;color:#94a3b8"> /4</span></div>
        <div class="avg-label">Score global</div>
        <div><span class="niveau-badge">${niveauLbl}</span></div>
      </div>
    </div>

    <!-- Identité -->
    <div class="section-title">Informations collaborateur</div>
    <div class="identity">
      <div class="identity-item"><div class="lbl">Nom & Prénom</div><div class="val">${reponse.prenom} ${(reponse.nom||'').toUpperCase()}</div></div>
      <div class="identity-item"><div class="lbl">Poste</div><div class="val">${reponse.poste}</div></div>
      <div class="identity-item"><div class="lbl">Type de bilan</div><div class="val">${reponse.questionnaire}</div></div>
      <div class="identity-item"><div class="lbl">Date de prise de poste</div><div class="val">${reponse.datePriseDeFonction || '—'}</div></div>
      <div class="identity-item"><div class="lbl">Date de complétion</div><div class="val">${reponse.dateCompletion || '—'}</div></div>
      <div class="identity-item"><div class="lbl">Référent</div><div class="val">${reponse.referent || '—'}</div></div>
    </div>

    <!-- Réponses par domaine -->
    <div class="section-title" style="margin-top:8px">Résultats détaillés</div>
    ${domainesHTML}

    <!-- Pied de page -->
    <div class="footer">
      <p>Centre de Médecine du Sommeil · Usage interne · Données confidentielles</p>
      <p>Généré le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
    </div>
  </div>
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) win.focus();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

// ─── Panneau de détail d'une réponse ─────────────────────────────────────────
function noteColor(v: number) {
  if (v >= 4) return 'bg-green-500';
  if (v >= 3) return 'bg-blue-500';
  if (v >= 2) return 'bg-orange-400';
  return 'bg-red-500';
}
function noteLabel(v: number) {
  if (v >= 4) return 'Très satisfait(e)';
  if (v >= 3) return 'Satisfait(e)';
  if (v >= 2) return 'Peu satisfait(e)';
  return 'Pas satisfait(e)';
}

function DetailPanel({
  reponse,
  configs,
  onClose,
}: {
  reponse: Reponse;
  configs: QuestionnaireConfig[];
  onClose: () => void;
}) {
  const cfg = configs.find(c => c.type === reponse.questionnaire) ?? DEFAULT_QUESTIONNAIRES.find(c => c.type === reponse.questionnaire);
  const avg = moyenne(reponse.notes.map(n => n.valeur));
  const init = `${(reponse.prenom || '?').charAt(0).toUpperCase()}${(reponse.nom || '?').charAt(0).toUpperCase()}`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-50 flex justify-end"
        onClick={onClose}
      >
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 320, damping: 38 }}
          className="w-full max-w-lg h-full bg-background shadow-2xl overflow-y-auto flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* En-tête */}
          <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">{init}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-foreground truncate">{reponse.prenom} {(reponse.nom || '').toUpperCase()}</h2>
              <p className="text-xs text-muted-foreground">{reponse.poste} · {reponse.questionnaire} · {reponse.dateCompletion || '—'}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {avg !== null && (
                <div className="text-right">
                  <p className="text-xl font-black font-mono text-foreground">{avg.toFixed(2)}</p>
                  <p className="text-[10px] text-muted-foreground">/ 4</p>
                </div>
              )}
              <button
                onClick={() => generatePDF(reponse, configs)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                PDF
              </button>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Corps */}
          <div className="flex-1 px-6 py-5 space-y-6">
            {/* Infos */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Référent', value: reponse.referent || '—' },
                { label: 'Date de prise de poste', value: reponse.datePriseDeFonction || '—' },
              ].map((f, i) => (
                <div key={i} className="bg-muted/50 rounded-xl p-3">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-0.5">{f.label}</p>
                  <p className="text-xs font-semibold text-foreground">{f.value}</p>
                </div>
              ))}
            </div>

            {/* Domaines */}
            {cfg ? cfg.domaines.map(domaine => {
              const domNotes = domaine.questionsNotes
                .map(q => ({ q, r: reponse.notes.find(n => n.questionId === q.id) }))
                .filter(({ r }) => r !== undefined);
              const domOuvertes = domaine.questionsOuvertes
                .map(q => ({ q, r: reponse.ouvertes.find(o => o.questionId === q.id) }))
                .filter(({ r }) => r?.texte);

              if (domNotes.length === 0 && domOuvertes.length === 0) return null;

              return (
                <div key={domaine.id}>
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full inline-block" />
                    {domaine.titre}
                  </h3>
                  <div className="space-y-3">
                    {/* Questions notées */}
                    {domNotes.map(({ q, r }) => (
                      <div key={q.id} className="bg-card border border-border rounded-xl p-3 flex items-start gap-3">
                        <Star className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground leading-relaxed">{q.label}</p>
                        </div>
                        <div className="flex-shrink-0 flex flex-col items-center gap-1">
                          <div className={`w-7 h-7 rounded-lg ${noteColor(r!.valeur)} flex items-center justify-center`}>
                            <span className="text-white text-xs font-black">{r!.valeur}</span>
                          </div>
                          <span className="text-[9px] text-muted-foreground text-center leading-tight max-w-[56px]">{noteLabel(r!.valeur)}</span>
                        </div>
                      </div>
                    ))}
                    {/* Questions ouvertes */}
                    {domOuvertes.map(({ q, r }) => (
                      <div key={q.id} className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                        <div className="flex items-start gap-2 mb-2">
                          <MessageSquare className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <p className="text-xs font-medium text-blue-700 leading-relaxed">{q.label}</p>
                        </div>
                        <p className="text-xs text-foreground leading-relaxed pl-5 italic">« {r!.texte} »</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }) : (
              <p className="text-sm text-muted-foreground text-center py-8">Configuration du questionnaire introuvable</p>
            )}
          </div>
        </motion.aside>
      </motion.div>
    </AnimatePresence>
  );
}

function TabDashboard() {
  const [reponses, setReponses] = useState<Reponse[]>([]);
  const [configs, setConfigs] = useState<QuestionnaireConfig[]>(DEFAULT_QUESTIONNAIRES);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Reponse | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [reps, cfgs] = await Promise.all([fetchReponses(), fetchConfig()]);
      setReponses(reps);
      if (cfgs.length > 0) setConfigs(cfgs);
    }
    catch { setReponses([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette réponse ?')) return;
    await removeReponse(id).catch(() => {});
    setReponses(prev => prev.filter(r => r.id !== id));
  };

  const handleExport = async () => {
    try {
      const csv = await exportCSVFromDb();
      if (!csv) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
      a.download = `reponses_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
    } catch { alert('Erreur export.'); }
  };

  const byQType = QTYPES_DASH.map(qt => {
    const subset = reponses.filter(r => r.questionnaire === qt);
    const vals = subset.flatMap(r => r.notes.map(n => n.valeur));
    return { name: LABELS_DASH[qt], avg: moyenne(vals), count: subset.length, fill: COLORS_DASH[qt] };
  });
  const byPoste = POSTES.map((p, i) => {
    const vals = reponses.filter(r => r.poste === p).flatMap(r => r.notes.map(n => n.valeur));
    return { name: p, avg: moyenne(vals), color: COLORS_POSTE[i] };
  }).filter(d => d.avg !== null);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-7 h-7 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {selected && (
        <DetailPanel
          reponse={selected}
          configs={configs}
          onClose={() => setSelected(null)}
        />
      )}
      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total réponses', value: reponses.length },
          { label: 'Moyenne globale', value: moyenne(reponses.flatMap(r => r.notes.map(n => n.valeur)))?.toFixed(2) ?? '—' },
          { label: 'Post formation', value: reponses.filter(r => r.questionnaire === 'post-formation').length },
          { label: 'Bilan 4-6 mois', value: reponses.filter(r => r.questionnaire === '4-6 mois').length },
        ].map((k, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <p className="text-[10px] text-muted-foreground font-medium mb-1 uppercase tracking-wide">{k.label}</p>
            <p className="text-2xl font-bold text-foreground font-mono">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Graphiques */}
      {reponses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wide mb-4">Moyenne par bilan</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={byQType} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 4]} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [v?.toFixed(2), 'Moy.']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="avg" radius={[6,6,0,0]}>
                  {byQType.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wide mb-4">Moyenne par poste</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={byPoste} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 8 }} />
                <YAxis domain={[0, 4]} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [v?.toFixed(2), 'Moy.']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="avg" radius={[6,6,0,0]}>
                  {byPoste.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tableau données */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/40">
          <div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Toutes les réponses ({reponses.length})</h3>
            {reponses.length > 0 && (
              <p className="text-[10px] text-muted-foreground mt-0.5">Cliquez sur une ligne pour voir le détail complet</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-[10px] font-semibold text-foreground hover:bg-muted transition-colors">
              <RefreshCw className="w-3 h-3" /> Actualiser
            </button>
            <button onClick={handleExport} disabled={reponses.length === 0} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40">
              <Download className="w-3 h-3" /> Export CSV
            </button>
          </div>
        </div>
        {reponses.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center">
            <Users className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Aucune réponse enregistrée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="border-b border-border">
                <tr>
                  {['Collaborateur', 'Poste', 'Bilan', 'Date', 'Moy.', 'Niveau', ''].map((h, i) => (
                    <th key={i} className={`py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wide ${i <= 3 ? 'text-left px-4' : 'text-center px-3'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reponses.map(r => {
                  const avg = moyenne(r.notes.map(n => n.valeur));
                  const init = `${(r.prenom||'?').charAt(0).toUpperCase()}${(r.nom||'?').charAt(0).toUpperCase()}`;
                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelected(r)}
                      className="border-t border-border hover:bg-primary/5 cursor-pointer transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-bold text-primary">{init}</span>
                          </div>
                          <span className="text-xs font-semibold text-foreground">{r.prenom} {(r.nom||'').toUpperCase()}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{r.poste}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold">{r.questionnaire}</span></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{r.dateCompletion || '—'}</td>
                      <td className="px-3 py-3 text-center text-xs font-bold font-mono">{avg?.toFixed(2) ?? '—'}</td>
                      <td className="px-3 py-3 text-center"><NiveauBadge avg={avg} /></td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                          <button
                            onClick={e => { e.stopPropagation(); handleDelete(r.id); }}
                            className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(isAdminAuthenticated());
  const [configs, setConfigs] = useState<QuestionnaireConfig[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [saveError, setSaveError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
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

  // Sécurité : si configs est vide ou activeQ ne matche rien, on force la valeur par défaut
  if (configs.length === 0) return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3 text-center">
        <AlertTriangle className="w-8 h-8 text-orange-500" />
        <p className="text-sm text-foreground font-semibold">Configuration introuvable</p>
        <p className="text-xs text-muted-foreground max-w-xs">La configuration n'a pas pu être chargée depuis Supabase.</p>
        <button
          type="button"
          onClick={() => { setLoadingConfig(true); fetchConfig().then(setConfigs).catch(() => setConfigs(DEFAULT_QUESTIONNAIRES.map(q => JSON.parse(JSON.stringify(q))))).finally(() => setLoadingConfig(false)); }}
          className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  );

  const currentConfig = configs.find(c => c.type === activeQ) ?? configs[0];

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
          { id: 'dashboard', label: 'Tableau de bord', icon: BarChart2 },
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

      {/* ── Onglet Dashboard ─────────────────────────────── */}
      {activeTab === 'dashboard' && <TabDashboard />}

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
