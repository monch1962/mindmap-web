import MindMapCanvas from './components/MindMapCanvas';
import './App.css';

function App() {
  // Start with a default root node
  const initialData = {
    id: 'root',
    content: 'Central Topic',
    children: [],
    position: { x: 400, y: 300 },
  };

  return <MindMapCanvas initialData={initialData} />;
}

export default App;
