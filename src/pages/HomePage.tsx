import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';
import { ClipboardList, Moon, ArrowRight, Users, CheckCircle2, BarChart2, Lock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { springPresets } from '@/lib/motion';

const BILANS = [
  {
    step: '1',
    label: 'Bilan 1 mois',
    desc: 'Accueil, prise de poste et premières impressions du collaborateur.',
    color: 'from-blue-500 to-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    border: 'border-blue-100',
  },
  {
    step: '2',
    label: 'Bilan 3 mois',
    desc: 'Montée en autonomie, formation et organisation du travail.',
    color: 'from-indigo-500 to-indigo-600',
    badge: 'bg-indigo-100 text-indigo-700',
    border: 'border-indigo-100',
  },
  {
    step: '3',
    label: 'Bilan 6 mois',
    desc: 'Intégration complète, compétences acquises et perspectives.',
    color: 'from-violet-500 to-violet-600',
    badge: 'bg-violet-100 text-violet-700',
    border: 'border-violet-100',
  },
];

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springPresets.gentle}
        className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 md:p-10 text-white shadow-md"
      >
        {/* Décor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Moon className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-xs font-semibold text-white/70 uppercase tracking-widest">Cabinet de Médecine du Sommeil</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-3">
            Suivi Post-Intégration
          </h1>
          <p className="text-sm text-white/80 max-w-lg leading-relaxed mb-8">
            Plateforme interne de gestion des bilans d'intégration. Chaque nouveau collaborateur
            est accompagné à 3 étapes clés grâce à des questionnaires personnalisés.
          </p>

          <Link
            to={ROUTE_PATHS.QUESTIONNAIRE}
            className="inline-flex items-center gap-2 px-5 py-3 bg-white text-primary rounded-xl text-sm font-bold hover:bg-white/90 transition-colors shadow-sm"
          >
            <ClipboardList className="w-4 h-4" />
            Remplir un questionnaire
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

      {/* ── Les 3 bilans ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springPresets.gentle, delay: 0.06 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-foreground">Les 3 étapes du suivi</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BILANS.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springPresets.gentle, delay: 0.08 + i * 0.06 }}
              className={`bg-card border ${b.border} rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className={`h-1.5 w-full bg-gradient-to-r ${b.color}`} />
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.badge}`}>Étape {b.step}</span>
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1.5">{b.label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Postes concernés ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springPresets.gentle, delay: 0.14 }}
        className="bg-card border border-border rounded-2xl p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4.5 h-4.5 text-primary" />
          <h2 className="text-sm font-bold text-foreground">Postes concernés</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {['Médecin', 'Infirmier(e)', 'Technicien du sommeil', 'Assistante médicale', 'Secrétaire médicale'].map((p) => (
            <span key={p} className="px-3 py-1.5 bg-primary/8 text-primary border border-primary/20 rounded-full text-xs font-semibold">
              {p}
            </span>
          ))}
        </div>
      </motion.div>

      {/* ── Actions ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springPresets.gentle, delay: 0.18 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Remplir un questionnaire */}
        <Link
          to={ROUTE_PATHS.QUESTIONNAIRE}
          className="group bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200"
        >
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
              <ClipboardList className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-1">
                Remplir un questionnaire
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Saisir le bilan d'un nouveau collaborateur. Nom, prénom et poste requis.
              </p>
            </div>
          </div>
        </Link>

        {/* Accès admin */}
        <Link
          to={ROUTE_PATHS.ADMIN}
          className="group bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200"
        >
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
              <Lock className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-1">
                Espace Admin
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Configurer les questionnaires, consulter les statistiques et exporter les données.
              </p>
              <div className="flex items-center gap-1 mt-2">
                <BarChart2 className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Tableau de bord · Export CSV · Configuration</span>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-center gap-2 pb-4"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground/50" />
        <p className="text-[11px] text-muted-foreground/60 text-center">
          Données stockées de manière sécurisée · Usage interne uniquement
        </p>
      </motion.div>
    </div>
  );
}
