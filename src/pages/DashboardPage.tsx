import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  POSTES,
  moyenne,
  niveauLabel,
  isAdminAuthenticated,
  adminLogin,
  type Reponse,
  type QType,
  type PosteType,
} from '@/lib/index';
import {
  fetchReponses,
  removeReponse,
  exportCSVFromDb,
  fetchConfig,
} from '@/lib/db';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { springPresets } from '@/lib/motion';
import {
  Download, Trash2, RefreshCw, Users, ClipboardList,
  TrendingUp, AlertCircle, Loader2, Lock, Eye, EyeOff, BarChart2,
} from 'lucide-react';

const QTYPES: QType[] = ['post-formation', '4-6 mois'];
const COLORS_QTYPE: Record<QType, string> = {
  'post-formation': '#3B82F6',
  '4-6 mois': '#8B5CF6',
};
const COLORS_POSTE = ['#2563EB', '#0D9488', '#7C3AED', '#D97706', '#DC2626'];

function Badge({ avg }: { avg: number | null }) {
  const { label, color } = niveauLabel(avg);
  const bg =
    avg === null ? 'bg-gray-100 text-gray-500'
    : avg >= 3.5 ? 'bg-green-100 text-green-700'
    : avg >= 3   ? 'bg-blue-100 text-blue-700'
    : avg >= 2.5 ? 'bg-orange-100 text-orange-700'
    : 'bg-red-100 text-red-700';
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${bg}`} style={{ color }}>
      {label} {avg !== null ? `(${avg.toFixed(2)})` : ''}
    </span>
  );
}

// ─── Onglet Synthèse ─────────────────────────────────────────────────────────
function TabSynthese({ reponses }: { reponses: Reponse[] }) {
  const byQType = QTYPES.map((qt) => {
    const subset = reponses.filter((r) => r.questionnaire === qt);
    const allNotes = subset.flatMap((r) => r.notes.map((n) => n.valeur));
    return { name: `Bilan ${qt}`, avg: moyenne(allNotes), count: subset.length };
  });
  const byPoste = POSTES.map((p, i) => {
    const subset = reponses.filter((r) => r.poste === p);
    const allNotes = subset.flatMap((r) => r.notes.map((n) => n.valeur));
    return { name: p, avg: moyenne(allNotes), count: subset.length, color: COLORS_POSTE[i] };
  });
  const heatmap = POSTES.map((p) => {
    const row: Record<string, unknown> = { poste: p };
    QTYPES.forEach((qt) => { row[qt] = reponses.filter((r) => r.poste === p && r.questionnaire === qt).length; });
    return row;
  });

  if (reponses.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <ClipboardList className="w-12 h-12 text-muted-foreground/30 mb-4" />
      <p className="text-sm font-medium text-muted-foreground">Aucune réponse enregistrée</p>
      <p className="text-xs text-muted-foreground/70 mt-1">Remplissez un questionnaire pour voir les statistiques ici.</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total réponses', value: reponses.length, mono: true },
          { label: 'Moyenne globale', value: moyenne(reponses.flatMap((r) => r.notes.map((n) => n.valeur)))?.toFixed(2) ?? '—', mono: true },
          { label: 'Postes différents', value: new Set(reponses.map((r) => r.poste)).size, mono: true },
          { label: 'Bilans complétés', value: `${new Set(reponses.map((r) => r.questionnaire)).size}/3`, mono: false },
        ].map((k, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground font-medium mb-1">{k.label}</p>
            <p className={`text-3xl font-bold text-foreground ${k.mono ? 'font-mono' : ''}`}>{k.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Moyenne globale par étape de bilan</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byQType} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 4]} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => [v?.toFixed(2), 'Moyenne']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
              {byQType.map((_, i) => <Cell key={i} fill={COLORS_QTYPE[QTYPES[i]]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 flex flex-wrap gap-3">
          {byQType.map((d, i) => (
            <span key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: COLORS_QTYPE[QTYPES[i]] }} />
              {d.name} — <strong>{d.count} rép.</strong> {d.avg !== null && <Badge avg={d.avg} />}
            </span>
          ))}
        </div>
      </div>
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Moyenne globale par poste</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byPoste} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis domain={[0, 4]} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => [v?.toFixed(2), 'Moyenne']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
              {byPoste.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Nombre de réponses par poste et étape</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-2 pr-4 text-xs font-semibold text-muted-foreground">Poste</th>
                {QTYPES.map((qt) => <th key={qt} className="text-center py-2 px-4 text-xs font-semibold text-muted-foreground">Bilan {qt}</th>)}
                <th className="text-center py-2 px-4 text-xs font-semibold text-muted-foreground">Total</th>
              </tr>
            </thead>
            <tbody>
              {heatmap.map((row, i) => {
                const total = QTYPES.reduce((s, qt) => s + ((row[qt] as number) || 0), 0);
                return (
                  <tr key={i} className="border-t border-border">
                    <td className="py-2.5 pr-4 text-xs font-medium text-foreground">{row.poste as string}</td>
                    {QTYPES.map((qt) => {
                      const v = (row[qt] as number) || 0;
                      return (
                        <td key={qt} className="text-center py-2.5 px-4">
                          <span className={`inline-flex w-8 h-8 rounded-lg text-xs font-bold items-center justify-center ${v === 0 ? 'bg-muted text-muted-foreground' : v >= 3 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{v}</span>
                        </td>
                      );
                    })}
                    <td className="text-center py-2.5 px-4 font-bold text-foreground text-xs">{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Onglet Détail par question ──────────────────────────────────────────────
function TabQuestions({ reponses }: { reponses: Reponse[] }) {
  const [selectedQ, setSelectedQ] = useState<QType>('post-formation');
  const [selectedPoste, setSelectedPoste] = useState<PosteType | 'Tous'>('Tous');
  const [configs, setConfigs] = useState<Array<{ type: QType; domaines: Array<{ titre: string; questionsNotes: Array<{ id: string; label: string; postes?: PosteType[] }> }> }>>([]);

  useEffect(() => {
    fetchConfig().then(setConfigs).catch(() => setConfigs([]));
  }, []);

  const config = configs.find((q) => q.type === selectedQ);
  const filteredReponses = reponses.filter((r) => r.questionnaire === selectedQ && (selectedPoste === 'Tous' || r.poste === selectedPoste));

  const questionStats = useMemo(() => {
    if (!config) return [];
    return config.domaines.flatMap((d) =>
      d.questionsNotes
        .filter((q) => !q.postes || selectedPoste === 'Tous' || q.postes.includes(selectedPoste as PosteType))
        .map((q) => {
          const vals = filteredReponses.map((r) => r.notes.find((n) => n.questionId === q.id)?.valeur).filter((v): v is number => v !== undefined);
          const dist = [1, 2, 3, 4].map((v) => ({ note: v, pct: vals.length > 0 ? Math.round((vals.filter((x) => x === v).length / vals.length) * 100) : 0 }));
          return { id: q.id, label: q.label, avg: moyenne(vals), n: vals.length, dist };
        })
    );
  }, [config, filteredReponses, selectedPoste]);

  const radarData = useMemo(() => {
    if (!config) return [];
    return config.domaines.map((d) => {
      const allVals = d.questionsNotes
        .filter((q) => !q.postes || selectedPoste === 'Tous' || q.postes.includes(selectedPoste as PosteType))
        .flatMap((q) => filteredReponses.map((r) => r.notes.find((n) => n.questionId === q.id)?.valeur).filter((v): v is number => v !== undefined));
      return { domaine: d.titre.length > 18 ? d.titre.slice(0, 18) + '…' : d.titre, moyenne: moyenne(allVals) ?? 0 };
    });
  }, [config, filteredReponses, selectedPoste]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-1.5">Étape du bilan</p>
          <div className="flex gap-2">
            {QTYPES.map((qt) => (
              <button key={qt} onClick={() => setSelectedQ(qt)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${selectedQ === qt ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-foreground hover:bg-muted'}`}>{qt}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-1.5">Poste</p>
          <div className="flex flex-wrap gap-2">
            {(['Tous', ...POSTES] as (PosteType | 'Tous')[]).map((p) => (
              <button key={p} onClick={() => setSelectedPoste(p)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${selectedPoste === p ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-foreground hover:bg-muted'}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{filteredReponses.length} réponse{filteredReponses.length > 1 ? 's' : ''} pour cette sélection</p>
      {filteredReponses.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center"><AlertCircle className="w-10 h-10 text-muted-foreground/30 mb-3" /><p className="text-sm text-muted-foreground">Aucune réponse pour cette sélection.</p></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Vue radar par domaine</h3>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="domaine" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 4]} tick={{ fontSize: 9 }} tickCount={5} />
                <Radar name="Moyenne" dataKey="moyenne" stroke={COLORS_QTYPE[selectedQ]} fill={COLORS_QTYPE[selectedQ]} fillOpacity={0.25} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Moyenne par domaine</h3>
            <div className="space-y-3">
              {radarData.map((d, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1"><span className="text-xs text-foreground font-medium truncate max-w-[180px]">{d.domaine}</span><Badge avg={d.moyenne > 0 ? d.moyenne : null} /></div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${(d.moyenne / 4) * 100}%`, background: COLORS_QTYPE[selectedQ] }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {filteredReponses.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-muted/40"><h3 className="text-sm font-semibold text-foreground">Détail par question</h3></div>
          <div className="divide-y divide-border">
            {questionStats.map((qs) => (
              <div key={qs.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-xs text-foreground font-medium leading-relaxed">{qs.label}</p>
                  <div className="flex items-center gap-2 flex-shrink-0"><span className="text-[10px] text-muted-foreground">{qs.n} rép.</span><Badge avg={qs.avg} /></div>
                </div>
                {qs.n > 0 && (
                  <div className="flex gap-1">
                    {qs.dist.map((d) => (
                      <div key={d.note} className="flex-1 text-center">
                        <div className="h-1.5 rounded-full mb-1" style={{ background: d.pct > 0 ? COLORS_QTYPE[selectedQ] : '#E5E7EB', opacity: d.pct > 0 ? 0.3 + (d.pct / 100) * 0.7 : 1 }} />
                        <span className="text-[10px] text-muted-foreground">{d.note}: {d.pct}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Onglet Progression ──────────────────────────────────────────────────────
function TabProgression({ reponses }: { reponses: Reponse[] }) {
  const data = POSTES.map((p, i) => {
    const row: Record<string, unknown> = { poste: p };
    QTYPES.forEach((qt) => { const subset = reponses.filter((r) => r.poste === p && r.questionnaire === qt); row[qt] = moyenne(subset.flatMap((r) => r.notes.map((n) => n.valeur))); });
    row.color = COLORS_POSTE[i];
    return row;
  }).filter((r) => QTYPES.some((qt) => r[qt] !== null));

  if (data.length === 0 || reponses.length === 0) return (
    <div className="flex flex-col items-center py-20 text-center">
      <TrendingUp className="w-12 h-12 text-muted-foreground/30 mb-4" />
      <p className="text-sm text-muted-foreground">Pas encore assez de données pour la progression.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Évolution des moyennes — toutes étapes confondues</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="poste" tick={{ fontSize: 10 }} />
            <YAxis domain={[0, 4]} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => [v?.toFixed(2), '']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Legend />
            {QTYPES.map((qt) => <Bar key={qt} dataKey={qt} name={`Bilan ${qt}`} fill={COLORS_QTYPE[qt]} radius={[4, 4, 0, 0]} />)}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/40"><h3 className="text-sm font-semibold text-foreground">Tableau de progression par poste</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground">Poste</th>
                {QTYPES.map((qt) => <th key={qt} className="text-center px-4 py-2.5 text-xs font-semibold text-muted-foreground">Bilan {qt}</th>)}
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-muted-foreground">Tendance</th>
              </tr>
            </thead>
            <tbody>
              {POSTES.map((p) => {
                const avgs = QTYPES.map((qt) => moyenne(reponses.filter((r) => r.poste === p && r.questionnaire === qt).flatMap((r) => r.notes.map((n) => n.valeur))));
                const first = avgs.find((a) => a !== null);
                const last = [...avgs].reverse().find((a) => a !== null);
                let tendance = '—', tendanceColor = 'text-muted-foreground';
                if (first != null && last != null && first !== last) { tendance = last > first ? 'Progression' : 'Régression'; tendanceColor = last > first ? 'text-green-600' : 'text-red-600'; }
                else if (first != null) { tendance = 'Stable'; tendanceColor = 'text-blue-600'; }
                return (
                  <tr key={p} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 text-xs font-medium text-foreground">{p}</td>
                    {avgs.map((avg, i) => <td key={i} className="text-center px-4 py-3"><Badge avg={avg} /></td>)}
                    <td className={`text-center px-4 py-3 text-xs font-semibold ${tendanceColor}`}>{tendance}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Onglet Données brutes ───────────────────────────────────────────────────
function TabDonnees({ reponses, onDelete }: { reponses: Reponse[]; onDelete: (id: string) => void }) {
  if (reponses.length === 0) return (
    <div className="flex flex-col items-center py-20 text-center">
      <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
      <p className="text-sm text-muted-foreground">Aucune réponse enregistrée.</p>
    </div>
  );
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              {['Collaborateur', 'Poste', 'Bilan', 'Date complétion', 'Référent', 'Moy.', 'Niveau', ''].map((h, i) => (
                <th key={i} className={`py-3 text-xs font-semibold text-muted-foreground ${i <= 4 ? 'text-left px-4' : 'text-center px-4'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reponses.map((r) => {
              const avg = moyenne(r.notes.map((n) => n.valeur));
              const initiales = `${(r.prenom || '?').charAt(0).toUpperCase()}${(r.nom || '?').charAt(0).toUpperCase()}`;
              return (
                <tr key={r.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-primary">{initiales}</span>
                      </div>
                      <p className="text-xs font-semibold text-foreground">{r.prenom} {r.nom ? r.nom.toUpperCase() : ''}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.poste}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-semibold">{r.questionnaire}</span></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.dateCompletion || '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.referent || '—'}</td>
                  <td className="px-4 py-3 text-center text-xs font-bold text-foreground font-mono">{avg?.toFixed(2) ?? '—'}</td>
                  <td className="px-4 py-3 text-center"><Badge avg={avg} /></td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => { if (window.confirm(`Supprimer la réponse de ${r.prenom} ${r.nom} ?`)) onDelete(r.id); }} className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Auth Gate Dashboard ─────────────────────────────────────────────────────
function DashboardAuthGate({ onLogin }: { onLogin: () => void }) {
  const [pwd, setPwd] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLogin(pwd)) { onLogin(); }
    else { setError('Mot de passe incorrect.'); setPwd(''); }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-sm shadow-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-sm">
            <BarChart2 className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-xs text-muted-foreground mt-1 text-center">Accès réservé aux administrateurs</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Mot de passe administrateur</label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={pwd}
                onChange={e => { setPwd(e.target.value); setError(''); }}
                placeholder="••••••••"
                autoFocus
                className="w-full px-3 py-2.5 pr-10 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
          </div>
          <button type="submit" className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" /> Accéder au tableau de bord
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Page Dashboard ───────────────────────────────────────────────────────────
type Tab = 'synthese' | 'questions' | 'progression' | 'donnees';

export default function DashboardPage() {
  const [authed, setAuthed] = useState(isAdminAuthenticated());
  const [tab, setTab] = useState<Tab>('synthese');
  const [reponses, setReponses] = useState<Reponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchReponses();
      setReponses(data);
    } catch (e) {
      setError('Impossible de charger les données. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    try {
      await removeReponse(id);
      setReponses((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert('Erreur lors de la suppression.');
    }
  };

  const handleExport = async () => {
    try {
      const csv = await exportCSVFromDb();
      if (!csv) return;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `questionnaires_sommeil_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Erreur lors de l\'export.');
    }
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: 'synthese', label: 'Synthèse' },
    { id: 'questions', label: 'Par question' },
    { id: 'progression', label: 'Progression' },
    { id: 'donnees', label: 'Données brutes' },
  ];

  if (!authed) return <DashboardAuthGate onLogin={() => setAuthed(true)} />;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={springPresets.gentle}>
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {loading ? 'Chargement…' : `${reponses.length} réponse${reponses.length > 1 ? 's' : ''} — données en temps réel depuis Supabase`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Actualiser
          </button>
          <button onClick={handleExport} disabled={reponses.length === 0 || loading} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40">
            <Download className="w-3.5 h-3.5" /> Exporter CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl mb-6">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Chargement des données…</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6 w-fit flex-wrap">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${tab === t.id ? 'bg-background text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'}`}>
                {t.label}
              </button>
            ))}
          </div>
          {tab === 'synthese'    && <TabSynthese   reponses={reponses} />}
          {tab === 'questions'   && <TabQuestions  reponses={reponses} />}
          {tab === 'progression' && <TabProgression reponses={reponses} />}
          {tab === 'donnees'     && <TabDonnees    reponses={reponses} onDelete={handleDelete} />}
        </>
      )}
    </motion.div>
  );
}
