import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import QuestionnairePage from '@/pages/QuestionnairePage';
import DashboardPage from '@/pages/DashboardPage';
import AdminPage from '@/pages/AdminPage';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path={ROUTE_PATHS.HOME} element={<HomePage />} />
          <Route path={ROUTE_PATHS.QUESTIONNAIRE} element={<QuestionnairePage />} />
          <Route path={ROUTE_PATHS.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTE_PATHS.ADMIN} element={<AdminPage />} />
          <Route path="*" element={<Navigate to={ROUTE_PATHS.HOME} replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
