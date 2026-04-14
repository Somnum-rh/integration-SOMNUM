import { Link } from 'react-router-dom';
import { ROUTE_PATHS, getReponses } from '@/lib/index';
import { ClipboardList, BarChart2, Moon, ArrowRight, Users, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { springPresets } from '@/lib/motion';

const STEPS = [
  {
    step: '1',
    label: 'Bilan 1 mois',
    desc: 'Accueil, prise de poste, premières impressions',
    color: 'bg-blue-50 border-blue-200',
    dot: 'bg-blue-500',
  },
  {
    step: '2',
    label: 'Bilan 3 mois',
    desc: 'Montée en autonomie, formation, organisation',
    color: 'bg-indigo-50 border-indigo-200',
    dot: 'bg-indigo-500',
  },
  {
    step: '3',
    label: 'Bilan 6 mois',
    desc: 'Intégration complète, compétences, perspectives',
    color: 'bg-violet-50 border-violet-200',
    dot: 'bg-violet-500',
  },
];

const POSTES_LIST = [
  'Médecin', 'Infirmier(e)', 'Technicien du sommeil', 'Assistante médicale', 'Secrétaire médicale',
];

export default function HomePage() {
  const total = getReponses().length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springPresets.gentle}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <Moon className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Cabinet de Médecine du Sommeil</p>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              Suivi Post-Intégration
            </h1>
          </div>
        </div>
        <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
          Plateforme interne de gestion des questionnaires post-intégration. Chaque nouveau collaborateur
          est évalué à 3 étapes clés. Toutes les réponses sont collectées ici et disponibles
          dans le tableau de bord statistique.
        </p>
      </motion.div>

      {/* Stats rapides */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springPresets.gentle, delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10"
      >
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-primary flex-shrink-0" />
          <div>
            <p className="text-2xl font-bold text-foreground font-mono">{total}</p>
            <p className="text-xs text-muted-foreground">Questionnaire{total > 1 ? 's' : ''} complété{total > 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-3">
          <Users className="w-8 h-8 text-primary flex-shrink-0" />
          <div>
            <p className="text-2xl font-bold text-foreground">{POSTES_LIST.length}</p>
            <p className="text-xs text-muted-foreground">Postes couverts</p>
          </div>
        </div>
        <div className="col-span-2 md:col-span-1 bg-card border border-border rounded-xl p-5 flex items-center gap-3">
          <BarChart2 className="w-8 h-8 text-primary flex-shrink-0" />
          <div>
            <p className="text-2xl font-bold text-foreground">3</p>
            <p className="text-xs text-muted-foreground">Étapes d'intégration</p>
          </div>
        </div>
      </motion.div>

      {/* Actions principales */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springPresets.gentle, delay: 0.1 }}
        className="grid md:grid-cols-2 gap-5 mb-10"
      >
        <Link
          to={ROUTE_PATHS.QUESTIONNAIRE}
          className="group bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl p-6 flex items-center justify-between transition-all duration-200 shadow-sm"
        >
          <div>
            <p className="text-xs font-semibold opacity-75 uppercase tracking-widest mb-1">Nouveau bilan</p>
            <p className="text-lg font-bold leading-tight">Remplir un questionnaire</p>
            <p className="text-xs opacity-75 mt-1">Pour un collaborateur en cours d'intégration</p>
          </div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-6 h-6 opacity-80" />
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to={ROUTE_PATHS.DASHBOARD}
          className="group bg-card border border-border hover:border-primary/30 hover:bg-muted/50 text-foreground rounded-xl p-6 flex items-center justify-between transition-all duration-200"
        >
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Statistiques</p>
            <p className="text-lg font-bold leading-tight">Tableau de bord</p>
            <p className="text-xs text-muted-foreground mt-1">Visualiser les données en temps réel</p>
          </div>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-primary" />
            <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </motion.div>

      {/* Étapes */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springPresets.gentle, delay: 0.15 }}
      >
        <h2 className="text-sm font-semibold text-foreground mb-3">Les 3 étapes d'intégration</h2>
        <div className="space-y-3">
          {STEPS.map((s) => (
            <div key={s.step} className={`border rounded-xl p-4 flex items-start gap-4 ${s.color}`}>
              <div className={`w-7 h-7 rounded-full ${s.dot} text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5`}>
                {s.step}
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{s.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Postes */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springPresets.gentle, delay: 0.2 }}
        className="mt-8"
      >
        <h2 className="text-sm font-semibold text-foreground mb-3">Postes concernés</h2>
        <div className="flex flex-wrap gap-2">
          {POSTES_LIST.map((p) => (
            <span key={p} className="px-3 py-1.5 bg-card border border-border rounded-full text-xs font-medium text-foreground">
              {p}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
