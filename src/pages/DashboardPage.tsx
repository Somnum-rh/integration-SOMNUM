import { useState, useMemo } from 'react';
import {
  getReponses,
  deleteReponse,
  exportCSV,
  QUESTIONNAIRES,
  POSTES,
  moyenne,
  niveauLabel,
  type Reponse,
  type QType,
  type PosteType,
} from '@/lib/index';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { springPresets } from '@/lib/motion';
import {
  Download,
  Trash2,
  RefreshCw,
  Users,
  ClipboardList,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

const QTYPES: QType[] = ['1 mois', '3 mois', '6 mois'];
const COLORS_QTYPE: Record<QType, string> = {
  '1 mois': '#3B82F6',
  '3 mois': '#6366F1',
  '6 mois': '#8B5CF6',
};
const COLORS_POSTE = ['#2563EB', '#0D9488', '#7C3AED', '#D97706', '#DC2626'];

function Badge({ avg }: { avg: number | null }) {
  const { label, color } = niveauLabel(avg);
  const bg =
    avg === null
      ? 'bg-gray-100 text-gray-500'
      : avg >= 3.5
      ? 'bg-green-100 text-green-700'
      : avg >= 3
      ? 'bg-blue-100 text-blue-700'
      : avg >= 2.5
      ? 'bg-orange-100 text-orange-700'
      : 'bg-red-100 text-red-700';
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${bg}`} style={{ color }}>
      {label} {avg !== null ? `(${avg.toFixed(2)})` : ''}
    </span>
  );
}

// ─── Onglet Synthèse ─────────────────────────────────────────────────────────
function TabSynthese({ reponses }: { reponses: Reponse[] }) {
  // Moyenne globale par questionnaire
  const byQType = QTYPES.map((qt) => {
    const subset = reponses.filter((r) => r.questionnaire === qt);
    const allNotes = subset.flatMap((r) => r.notes.map((n) => n.valeur));
    const avg = moyenne(allNotes);
    return { name: `Bilan ${qt}`, avg, count: subset.length };
  });

  // Moyenne par poste (globale)
  const byPoste = POSTES.map((p, i) => {
    const subset = reponses.filter((r) => r.poste === p);
    const allNotes = subset.flatMap((r) => r.notes.map((n) => n.valeur));
    const avg = moyenne(allNotes);
    return { name: p, avg, count: subset.length, color: COLORS_POSTE[i] };
  });

  // Nombre de réponses par questionnaire par poste (heatmap simplifié)
  const heatmap = POSTES.map((p) => {
    const row: Record<string, unknown> = { poste: p };
    QTYPES.forEach((qt) => {
      row[qt] = reponses.filter((r) => r.poste === p && r.questionnaire === qt).length;
    });
    return row;
  });

  if (reponses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ClipboardList className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <p className="text-sm font-medium text-muted-foreground">Aucune réponse enregistrée</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Remplissez un questionnaire pour voir les statistiques ici.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground font-medium mb-1">Total réponses</p>
          <p className="text-3xl font-bold text-foreground font-mono">{reponses.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground font-medium mb-1">Moyenne globale</p>
          <p className="text-3xl font-bold text-foreground font-mono">
            {moyenne(reponses.flatMap((r) => r.notes.map((n) => n.valeur)))?.toFixed(2) ?? '—'}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground font-medium mb-1">Postes différents</p>
          <p className="text-3xl font-bold text-foreground font-mono">
            {new Set(reponses.map((r) => r.poste)).size}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground font-medium mb-1">Bilans complétés</p>
          <p className="text-3xl font-bold text-foreground font-mono">
            {new Set(reponses.map((r) => r.questionnaire)).size}/3
          </p>
        </div>
      </div>

      {/* Bar chart moyenne par questionnaire */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Moyenne globale par étape de bilan</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byQType} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 4]} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(v: number) => [v?.toFixed(2), 'Moyenne']}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }}
            />
            <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
              {byQType.map((entry, i) => (
                <Cell key={i} fill={COLORS_QTYPE[QTYPES[i]]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 flex flex-wrap gap-3">
          {byQType.map((d, i) => (
            <span key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: COLORS_QTYPE[QTYPES[i]] }} />
              {d.name} — <strong>{d.count} réponse{d.count > 1 ? 's' : ''}</strong>
              {d.avg !== null && <Badge avg={d.avg} />}
            </span>
          ))}
        </div>
      </div>

      {/* Bar chart par poste */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Moyenne globale par poste</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byPoste} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis domain={[0, 4]} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(v: number) => [v?.toFixed(2), 'Moyenne']}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }}
            />
            <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
              {byPoste.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Heatmap réponses */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Nombre de réponses par poste et étape</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-2 pr-4 text-xs font-semibold text-muted-foreground">Poste</th>
                {QTYPES.map((qt) => (
                  <th key={qt} className="text-center py-2 px-4 text-xs font-semibold text-muted-foreground">
                    Bilan {qt}
                  </th>
                ))}
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
                          <span
                            className={`inline-block w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center ${
                              v === 0
                                ? 'bg-muted text-muted-foreground'
                                : v >= 3
                                ? 'bg-green-100 text-green-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {v}
                          </span>
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
  const [selectedQ, setSelectedQ] = useState<QType>('1 mois');
  const [selectedPoste, setSelectedPoste] = useState<PosteType | 'Tous'>('Tous');

  const config = QUESTIONNAIRES.find((q) => q.type === selectedQ)!;

  const filteredReponses = reponses.filter(
    (r) =>
      r.questionnaire === selectedQ &&
      (selectedPoste === 'Tous' || r.poste === selectedPoste)
  );

  // Compute stats per question
  const questionStats = config.domaines.flatMap((d) =>
    d.questionsNotes
      .filter((q) => !q.postes || selectedPoste === 'Tous' || q.postes.includes(selectedPoste as PosteType))
      .map((q) => {
        const vals = filteredReponses
          .map((r) => r.notes.find((n) => n.questionId === q.id)?.valeur)
          .filter((v): v is number => v !== undefined);

        const dist = [1, 2, 3, 4].map((v) => ({
          note: v,
          count: vals.filter((x) => x === v).length,
          pct: vals.length > 0 ? Math.round((vals.filter((x) => x === v).length / vals.length) * 100) : 0,
        }));

        return {
          id: q.id,
          label: q.label,
          domaine: d.titre,
          postes: q.postes,
          avg: moyenne(vals),
          n: vals.length,
          dist,
        };
      })
  );

  // Radar data
  const radarData = config.domaines.map((d) => {
    const allVals = d.questionsNotes
      .filter((q) => !q.postes || selectedPoste === 'Tous' || q.postes.includes(selectedPoste as PosteType))
      .flatMap((q) =>
        filteredReponses
          .map((r) => r.notes.find((n) => n.questionId === q.id)?.valeur)
          .filter((v): v is number => v !== undefined)
      );
    return {
      domaine: d.titre.length > 18 ? d.titre.slice(0, 18) + '…' : d.titre,
      moyenne: moyenne(allVals) ?? 0,
    };
  });

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-1.5">Étape du bilan</p>
          <div className="flex gap-2">
            {QTYPES.map((qt) => (
              <button
                key={qt}
                onClick={() => setSelectedQ(qt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  selectedQ === qt
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border text-foreground hover:bg-muted'
                }`}
              >
                {qt}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-1.5">Poste</p>
          <div className="flex flex-wrap gap-2">
            {['Tous', ...POSTES].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPoste(p as PosteType | 'Tous')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  selectedPoste === p
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border text-foreground hover:bg-muted'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {filteredReponses.length} réponse{filteredReponses.length > 1 ? 's' : ''} pour cette sélection
      </p>

      {filteredReponses.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <AlertCircle className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">Aucune réponse pour cette sélection.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Radar */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Vue radar par domaine</h3>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="domaine" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 4]} tick={{ fontSize: 9 }} tickCount={5} />
                <Radar
                  name="Moyenne"
                  dataKey="moyenne"
                  stroke={COLORS_QTYPE[selectedQ]}
                  fill={COLORS_QTYPE[selectedQ]}
                  fillOpacity={0.25}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Moyennes par domaine */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Moyenne par domaine</h3>
            <div className="space-y-3">
              {radarData.map((d, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-foreground font-medium truncate max-w-[180px]">{d.domaine}</span>
                    <Badge avg={d.moyenne > 0 ? d.moyenne : null} />
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(d.moyenne / 4) * 100}%`,
                        background: COLORS_QTYPE[selectedQ],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Détail question par question */}
      {filteredReponses.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-muted/40">
            <h3 className="text-sm font-semibold text-foreground">Détail par question</h3>
          </div>
          <div className="divide-y divide-border">
            {questionStats.map((qs) => (
              <div key={qs.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-xs text-foreground font-medium leading-relaxed">{qs.label}</p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-muted-foreground">{qs.n} rép.</span>
                    <Badge avg={qs.avg} />
                  </div>
                </div>
                {qs.n > 0 && (
                  <div className="flex gap-1">
                    {qs.dist.map((d) => (
                      <div key={d.note} className="flex-1 text-center">
                        <div
                          className="h-1.5 rounded-full mb-1"
                          style={{
                            background: d.pct > 0 ? COLORS_QTYPE[selectedQ] : '#E5E7EB',
                            opacity: d.pct > 0 ? 0.3 + (d.pct / 100) * 0.7 : 1,
                          }}
                        />
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
    QTYPES.forEach((qt) => {
      const subset = reponses.filter((r) => r.poste === p && r.questionnaire === qt);
      const allNotes = subset.flatMap((r) => r.notes.map((n) => n.valeur));
      row[qt] = moyenne(allNotes);
    });
    row.color = COLORS_POSTE[i];
    return row;
  }).filter((r) => QTYPES.some((qt) => r[qt] !== null));

  if (data.length === 0 || reponses.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <TrendingUp className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <p className="text-sm text-muted-foreground">Pas encore assez de données pour la progression.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bar groupé */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Évolution des moyennes — toutes étapes confondues</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="poste" tick={{ fontSize: 10 }} />
            <YAxis domain={[0, 4]} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(v: number) => [v?.toFixed(2), '']}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Legend />
            {QTYPES.map((qt) => (
              <Bar key={qt} dataKey={qt} name={`Bilan ${qt}`} fill={COLORS_QTYPE[qt]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tableau progression */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/40">
          <h3 className="text-sm font-semibold text-foreground">Tableau de progression par poste</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground">Poste</th>
                {QTYPES.map((qt) => (
                  <th key={qt} className="text-center px-4 py-2.5 text-xs font-semibold text-muted-foreground">
                    Bilan {qt}
                  </th>
                ))}
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-muted-foreground">Tendance</th>
              </tr>
            </thead>
            <tbody>
              {POSTES.map((p) => {
                const avgs = QTYPES.map((qt) => {
                  const subset = reponses.filter((r) => r.poste === p && r.questionnaire === qt);
                  return moyenne(subset.flatMap((r) => r.notes.map((n) => n.valeur)));
                });
                const first = avgs.find((a) => a !== null);
                const last = [...avgs].reverse().find((a) => a !== null);
                let tendance = '—';
                let tendanceColor = 'text-muted-foreground';
                if (first !== null && last !== null && first !== undefined && last !== undefined && first !== last) {
                  if (last > first) {
                    tendance = 'Progression';
                    tendanceColor = 'text-green-600';
                  } else {
                    tendance = 'Régression';
                    tendanceColor = 'text-red-600';
                  }
                } else if (first !== null && last !== null && first !== undefined) {
                  tendance = 'Stable';
                  tendanceColor = 'text-blue-600';
                }

                return (
                  <tr key={p} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 text-xs font-medium text-foreground">{p}</td>
                    {avgs.map((avg, i) => (
                      <td key={i} className="text-center px-4 py-3">
                        <Badge avg={avg} />
                      </td>
                    ))}
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
function TabDonnees({
  reponses,
  onDelete,
}: {
  reponses: Reponse[];
  onDelete: (id: string) => void;
}) {
  if (reponses.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <p className="text-sm text-muted-foreground">Aucune réponse enregistrée.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Poste</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Bilan</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Date complétion</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Référent</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Nb notes</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Moyenne</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Niveau</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {reponses.map((r) => {
              const avg = moyenne(r.notes.map((n) => n.valeur));
              return (
                <tr key={r.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-foreground">{r.poste}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-semibold">
                      {r.questionnaire}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.dateCompletion || '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.referent || '—'}</td>
                  <td className="px-4 py-3 text-center text-xs text-foreground font-mono">{r.notes.length}</td>
                  <td className="px-4 py-3 text-center text-xs font-bold text-foreground font-mono">
                    {avg?.toFixed(2) ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge avg={avg} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => {
                        if (window.confirm('Supprimer cette réponse ?')) onDelete(r.id);
                      }}
                      className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                    >
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

// ─── Page Dashboard ───────────────────────────────────────────────────────────
type Tab = 'synthese' | 'questions' | 'progression' | 'donnees';

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>('synthese');
  const [reponses, setReponses] = useState<Reponse[]>(() => getReponses());

  const refresh = () => setReponses(getReponses());

  const handleDelete = (id: string) => {
    deleteReponse(id);
    refresh();
  };

  const handleExport = () => {
    const csv = exportCSV();
    if (!csv) return;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `questionnaires_sommeil_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: 'synthese', label: 'Synthèse' },
    { id: 'questions', label: 'Par question' },
    { id: 'progression', label: 'Progression' },
    { id: 'donnees', label: 'Données brutes' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springPresets.gentle}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Statistiques en temps réel — {reponses.length} réponse{reponses.length > 1 ? 's' : ''} enregistrée{reponses.length > 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Actualiser
          </button>
          <button
            onClick={handleExport}
            disabled={reponses.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" /> Exporter CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6 w-fit flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
              tab === t.id
                ? 'bg-background text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'synthese' && <TabSynthese reponses={reponses} />}
      {tab === 'questions' && <TabQuestions reponses={reponses} />}
      {tab === 'progression' && <TabProgression reponses={reponses} />}
      {tab === 'donnees' && <TabDonnees reponses={reponses} onDelete={handleDelete} />}
    </motion.div>
  );
}
