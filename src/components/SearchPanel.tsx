import { useState } from 'react';

export interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
  searchInNotes: boolean;
  filterIcon?: string;
  filterCloud?: string;
  filterDate?: 'hour' | 'day' | 'week' | 'month';
}

interface SearchPanelProps {
  onSearch: (query: string, options: SearchOptions) => void;
  onNext: () => void;
  onPrevious: () => void;
  resultCount: number;
  currentResult: number;
  availableIcons?: string[];
  availableClouds?: string[];
}

export default function SearchPanel({
  onSearch,
  onNext,
  onPrevious,
  resultCount,
  currentResult,
  availableIcons = [],
  availableClouds = [],
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
    const newValue = !options[key];
    setOptions((prev) => ({ ...prev, [key]: newValue }));
    // Re-search when option changes
    if (query) {
      onSearch(query, { ...options, [key]: newValue });
    }
  };

  const setFilter = (key: keyof SearchOptions, value: any) => {
    setOptions((prev) => ({ ...prev, [key]: value || undefined }));
    // Re-search when filter changes
    onSearch(query, { ...options, [key]: value || undefined });
  };

  const activeFilterCount = [
    options.filterIcon,
    options.filterCloud,
    options.filterDate,
  ].filter(Boolean).length;

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
        minWidth: '420px',
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
            background: showAdvanced || activeFilterCount > 0 ? '#3b82f6' : '#f3f4f6',
            color: showAdvanced || activeFilterCount > 0 ? 'white' : '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            position: 'relative',
          }}
        >
          Options
          {activeFilterCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#ef4444',
                color: 'white',
                fontSize: '9px',
                padding: '1px 4px',
                borderRadius: '8px',
              }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>
      </form>

      {showAdvanced && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* Text search options */}
          <div
            style={{
              padding: '8px',
              background: '#f9fafb',
              borderRadius: '4px',
              border: '1px solid #e5e7eb',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '6px', color: '#6b7280' }}>
              TEXT OPTIONS
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '12px' }}>
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
          </div>

          {/* Filters */}
          <div
            style={{
              padding: '8px',
              background: '#f9fafb',
              borderRadius: '4px',
              border: '1px solid #e5e7eb',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '6px', color: '#6b7280' }}>
              FILTERS
            </div>

            {/* Icon filter */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '12px', marginBottom: '4px' }}>Filter by icon:</div>
              <select
                value={options.filterIcon || ''}
                onChange={(e) => setFilter('filterIcon', e.target.value)}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '12px',
                  width: '100%',
                }}
              >
                <option value="">Any icon</option>
                {availableIcons.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </div>

            {/* Cloud filter */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '12px', marginBottom: '4px' }}>Filter by cloud:</div>
              <select
                value={options.filterCloud || ''}
                onChange={(e) => setFilter('filterCloud', e.target.value)}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '12px',
                  width: '100%',
                }}
              >
                <option value="">Any cloud</option>
                {availableClouds.map((cloud) => (
                  <option key={cloud} value={cloud}>
                    {cloud}
                  </option>
                ))}
              </select>
            </div>

            {/* Date filter */}
            <div>
              <div style={{ fontSize: '12px', marginBottom: '4px' }}>Filter by date modified:</div>
              <select
                value={options.filterDate || ''}
                onChange={(e) => setFilter('filterDate', e.target.value)}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '12px',
                  width: '100%',
                }}
              >
                <option value="">Any time</option>
                <option value="hour">Last hour</option>
                <option value="day">Last 24 hours</option>
                <option value="week">Last week</option>
                <option value="month">Last month</option>
              </select>
            </div>
          </div>
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
