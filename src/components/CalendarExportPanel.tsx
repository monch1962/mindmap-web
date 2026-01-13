import { useMemo } from 'react';
import type { MindMapTree } from '../types';
import {
  exportToICS,
  exportToCSV,
  openInGoogleCalendar,
  exportAllToGoogleCalendar,
  generateTaskSummary,
  generateCalendarHeatmap,
} from '../utils/calendarExport';

interface CalendarExportPanelProps {
  visible: boolean;
  onClose: () => void;
  tree: MindMapTree | null;
}

export default function CalendarExportPanel({ visible, onClose, tree }: CalendarExportPanelProps) {
  // Use useMemo to derive state from tree prop instead of setState in useEffect
  const summary = useMemo(() => {
    if (!tree) {
      return {
        total: 0,
        completed: 0,
        pending: 0,
        overdue: 0,
        upcoming: 0,
      };
    }
    return generateTaskSummary(tree);
  }, [tree]);

  const heatmap = useMemo(() => {
    if (!tree) return [];
    return generateCalendarHeatmap(tree);
  }, [tree]);

  const handleExportICS = () => {
    if (!tree) return;
    exportToICS(tree, 'mindmap-tasks.ics');
  };

  const handleExportCSV = () => {
    if (!tree) return;
    exportToCSV(tree, 'mindmap-tasks.csv');
  };

  const handleOpenGoogleCalendar = () => {
    if (!tree) return;
    openInGoogleCalendar(tree);
  };

  const handleExportAllGoogle = () => {
    if (!tree) return;
    exportAllToGoogleCalendar(tree);
  };

  if (!visible) return null;

  const getCompletionPercentage = () => {
    if (summary.total === 0) return 0;
    return Math.round((summary.completed / summary.total) * 100);
  };

  const maxCount = Math.max(...heatmap.map(d => d.count), 1);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="calendar-export-title"
      style={{
        position: 'fixed',
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '420px',
        maxHeight: '80vh',
        background: 'white',
        border: '1px solid #d1d5db',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '12px 12px 0 0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>📅</span>
          <h2 id="calendar-export-title" style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
            Calendar Export
          </h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Close calendar export panel"
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
          }}
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
        {/* Task Summary */}
        <div role="region" aria-labelledby="task-summary-title" style={{ marginBottom: '20px' }}>
          <h3 id="task-summary-title" style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#374151' }}>
            Task Summary
          </h3>

          <div
            role="group"
            aria-label={`Task statistics: ${summary.total} total, ${summary.completed} completed, ${summary.pending} pending, ${summary.overdue} overdue`}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              marginBottom: '12px',
            }}
          >
            <div
              style={{
                padding: '12px',
                background: '#f3f4f6',
                borderRadius: '6px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                {summary.total}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Total Tasks</div>
            </div>

            <div
              style={{
                padding: '12px',
                background: '#ecfdf5',
                borderRadius: '6px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                {summary.completed}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Completed</div>
            </div>

            <div
              style={{
                padding: '12px',
                background: '#fef3c7',
                borderRadius: '6px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                {summary.pending}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Pending</div>
            </div>

            <div
              style={{
                padding: '12px',
                background: '#fee2e2',
                borderRadius: '6px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
                {summary.overdue}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Overdue</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div role="progressbar" aria-valuenow={getCompletionPercentage()} aria-valuemin={0} aria-valuemax={100} aria-label={`Task completion: ${getCompletionPercentage()}%`} style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
              <span style={{ color: '#6b7280' }}>Progress</span>
              <span style={{ fontWeight: 'bold', color: '#374151' }}>{getCompletionPercentage()}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '4px' }}>
              <div
                style={{
                  width: `${getCompletionPercentage()}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #10b981 0%, #3b82f6 100%)',
                  borderRadius: '4px',
                  transition: 'width 0.3s',
                }}
              />
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div role="group" aria-labelledby="export-options-title" style={{ marginBottom: '20px' }}>
          <h3 id="export-options-title" style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#374151' }}>
            Export Options
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={handleExportICS}
              aria-label="Download mind map tasks as ICS file for iCalendar"
              style={{
                padding: '12px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '16px' }}>📥</span>
              Download ICS File (iCalendar)
            </button>

            <button
              onClick={handleExportCSV}
              aria-label="Export mind map tasks as CSV file"
              style={{
                padding: '12px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '16px' }}>📊</span>
              Export as CSV
            </button>

            <button
              onClick={handleOpenGoogleCalendar}
              aria-label="Open first task in Google Calendar"
              style={{
                padding: '12px',
                background: '#4285f4',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '16px' }}>📆</span>
              Open in Google Calendar (First Task)
            </button>

            <button
              onClick={handleExportAllGoogle}
              aria-label="Export all tasks to Google Calendar"
              style={{
                padding: '12px',
                background: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '16px' }}>📅</span>
              Export All to Google Calendar
            </button>
          </div>
        </div>

        {/* Calendar Heatmap */}
        {heatmap.length > 0 && (
          <div role="region" aria-labelledby="activity-calendar-title">
            <h3 id="activity-calendar-title" style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#374151' }}>
              Activity Calendar
            </h3>

            <div
              role="grid"
              aria-label={`Activity calendar showing ${heatmap.length} days`}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '4px',
                marginBottom: '8px',
              }}
            >
              {heatmap.slice(-28).map(({ date, count }) => {
                const intensity = count / maxCount;
                const bg = intensity === 0
                  ? '#f3f4f6'
                  : intensity < 0.25
                    ? '#c7d2fe'
                    : intensity < 0.5
                      ? '#818cf8'
                      : intensity < 0.75
                        ? '#4f46e5'
                        : '#312e81';

                return (
                  <div
                    key={date}
                    role="gridcell"
                    aria-label={`${date}: ${count} tasks`}
                    title={`${date}: ${count} tasks`}
                    style={{
                      aspectRatio: 1,
                      background: bg,
                      borderRadius: '2px',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  />
                );
              })}
            </div>

            <div role="legend" aria-label="Activity intensity legend" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#6b7280' }}>
              <span>Less</span>
              <div style={{ display: 'flex', gap: '2px' }}>
                <div style={{ width: '12px', height: '12px', background: '#f3f4f6', borderRadius: '2px' }} />
                <div style={{ width: '12px', height: '12px', background: '#c7d2fe', borderRadius: '2px' }} />
                <div style={{ width: '12px', height: '12px', background: '#818cf8', borderRadius: '2px' }} />
                <div style={{ width: '12px', height: '12px', background: '#4f46e5', borderRadius: '2px' }} />
                <div style={{ width: '12px', height: '12px', background: '#312e81', borderRadius: '2px' }} />
              </div>
              <span>More</span>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div
          role="region"
          aria-labelledby="calendar-help-title"
          style={{
            marginTop: '20px',
            padding: '12px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '6px',
            fontSize: '11px',
            color: '#1e40af',
          }}
        >
          <strong id="calendar-help-title">Tip:</strong> Add due dates to nodes using metadata to create calendar events.
          Tasks are detected from checkbox nodes or content containing "task", "todo", or "deadline".
        </div>
      </div>
    </div>
  );
}
