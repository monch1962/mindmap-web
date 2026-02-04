import MindMapCanvas from './components/MindMapCanvas'
import { ErrorBoundary } from './components/ErrorBoundary'
import SkipToContent from './components/SkipToContent'
import './App.css'

function App() {
  // Start with a default root node
  const initialData = {
    id: 'root',
    content: 'Central Topic',
    children: [],
    position: { x: 400, y: 300 },
  }

  return (
    <ErrorBoundary>
      <SkipToContent
        targets={[
          {
            id: 'mindmap-canvas',
            label: 'Skip to mind map canvas',
            description: 'Jump directly to the interactive mind map',
          },
          {
            id: 'main-controls',
            label: 'Skip to main controls',
            description: 'Jump to toolbar and action buttons',
          },
          {
            id: 'search-panel',
            label: 'Skip to search',
            description: 'Jump to search functionality',
          },
        ]}
      />
      <main id="main-content" role="main" tabIndex={-1}>
        <MindMapCanvas initialData={initialData} />
      </main>
    </ErrorBoundary>
  )
}

export default App
