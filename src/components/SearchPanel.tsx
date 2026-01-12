import { useState } from 'react';

export interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
  searchInNotes: boolean;
}

interface SearchPanelProps {
  onSearch: (query: string, options: SearchOptions) => void;
  onNext: () => void;
  onPrevious: () => void;
  resultCount: number;
  currentResult: number;
}

export default function SearchPanel({
  onSearch,
  onNext,
  onPrevious,
  resultCount,
  currentResult,
}: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<SearchOptions>({
    caseSensitive: false,
    wholeWord: false,
    useRegex: false,
    searchInNotes: false,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, options);
  };

  const toggleOption = (key: keyof SearchOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
    // Re-search when option changes
    if (query) {
      onSearch(query, { ...options, [key]: !options[key] });
    }
  };

  return (
    <div
      style={{
        padding: '12px',
        background: 'white',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        minWidth: '400px',
      }}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '6px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search nodes... (Ctrl+F)"
          style={{
            flex: 1,
            padding: '6px 10px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '13px',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '6px 12px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            padding: '6px 10px',
            background: showAdvanced ? '#3b82f6' : '#f3f4f6',
            color: showAdvanced ? 'white' : '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
          }}
        >
          Options
        </button>
      </form>

      {showAdvanced && (
        <div
          style={{
            padding: '8px',
            background: '#f9fafb',
            borderRadius: '4px',
            border: '1px solid #e5e7eb',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '12px',
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={options.caseSensitive}
              onChange={() => toggleOption('caseSensitive')}
              style={{ cursor: 'pointer' }}
            />
            Case sensitive
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={options.wholeWord}
              onChange={() => toggleOption('wholeWord')}
              style={{ cursor: 'pointer' }}
            />
            Whole word
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={options.useRegex}
              onChange={() => toggleOption('useRegex')}
              style={{ cursor: 'pointer' }}
            />
            Regular expression
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={options.searchInNotes}
              onChange={() => toggleOption('searchInNotes')}
              style={{ cursor: 'pointer' }}
            />
            Search in notes
          </label>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {resultCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                fontSize: '12px',
                color: '#666',
              }}
            >
              {currentResult + 1} / {resultCount}
            </div>
            <button
              onClick={onPrevious}
              title="Previous result (Shift+F3)"
              style={{
                padding: '4px 10px',
                background: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              ↑ Previous
            </button>
            <button
              onClick={onNext}
              title="Next result (F3)"
              style={{
                padding: '4px 10px',
                background: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              ↓ Next
            </button>
          </div>
        )}

        {resultCount === 0 && query && (
          <div
            style={{
              fontSize: '12px',
              color: '#ef4444',
            }}
          >
            No results found
          </div>
        )}
      </div>
    </div>
  );
}
