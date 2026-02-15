import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import WorkflowSelector from './components/layout/WorkflowSelector';
import useAppStore from './store/useAppStore';
import useProjectStore from './store/useProjectStore';
import { fetchOpenRouterModels } from './api/claude';

const ScaffoldingWorkflow = lazy(() => import('./components/scaffolding/ScaffoldingWorkflow'));
const AnalysisWorkflow = lazy(() => import('./components/analysis/AnalysisWorkflow'));
const EditWorkflow = lazy(() => import('./components/edit/EditWorkflow'));
const HelpPage = lazy(() => import('./components/layout/HelpPage'));

function Loading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-purple-300 text-lg">Loading...</div>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-xl mx-auto mt-16 bg-red-900/40 border border-red-500 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-300 mb-2">Something went wrong</h2>
          <p className="text-sm text-red-200 mb-4">{this.state.error?.message}</p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-semibold"
          >
            Return Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const apiKey = useAppStore((s) => s.apiKey);
  const availableModels = useAppStore((s) => s.availableModels);
  const setAvailableModels = useAppStore((s) => s.setAvailableModels);
  const setModelsLoading = useAppStore((s) => s.setModelsLoading);

  // Restore .arcwrite/ system folder from IndexedDB on startup
  useEffect(() => {
    useProjectStore.getState().restoreFromIDB().then((restored) => {
      if (restored) console.log('[App] Restored .arcwrite/ from IndexedDB');
    });
  }, []);

  // Load OpenRouter model list in background on startup if API key exists
  useEffect(() => {
    if (apiKey && availableModels.length === 0) {
      setModelsLoading(true);
      fetchOpenRouterModels(apiKey)
        .then((models) => setAvailableModels(models))
        .catch(() => {}) // silent fail
        .finally(() => setModelsLoading(false));
    }
  }, []); // run once on mount

  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<WorkflowSelector />} />
            <Route path="scaffold" element={<ScaffoldingWorkflow />} />
            <Route path="analyze" element={<AnalysisWorkflow />} />
            <Route path="edit" element={<EditWorkflow />} />
            <Route path="help" element={<HelpPage />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
