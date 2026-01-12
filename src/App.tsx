import MindMapCanvas from './components/MindMapCanvas';
import { ErrorBoundary } from './components/ErrorBoundary';
import './App.css';

function App() {
  // Start with a default root node
  const initialData = {
    id: 'root',
    content: 'Central Topic',
    children: [],
    position: { x: 400, y: 300 },
  };

  return (
    <ErrorBoundary>
      <MindMapCanvas initialData={initialData} />
    </ErrorBoundary>
  );
}

export default App;
