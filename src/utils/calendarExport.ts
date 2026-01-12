/**
 * Calendar export utilities
 * Supports ICS file export and Google Calendar integration
 */

import type { MindMapTree } from '../types';

interface CalendarEvent {
  summary: string;
  description: string;
  location?: string;
  start: Date;
  end: Date;
  due?: Date;
  status?: 'NEEDS-ACTION' | 'COMPLETED' | 'IN-PROCESS' | 'CANCELLED';
  priority?: number;
}

/**
 * Export mind map to ICS (iCalendar) format
 */
export function exportToICS(tree: MindMapTree, filename: string = 'mindmap.ics'): void {
  const events = extractEventsFromTree(tree);
  const icsContent = generateICSContent(events);

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Generate ICS file content from events
 */
function generateICSContent(events: CalendarEvent[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MindMapWeb//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  events.forEach(event => {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${Date.now()}_${Math.random().toString(36).substr(2, 9)}@mindmapweb`);
    lines.push(`DTSTAMP:${formatICSDate(new Date())}`);
    lines.push(`DTSTART:${formatICSDate(event.start)}`);
    lines.push(`DTEND:${formatICSDate(event.end)}`);

    if (event.due) {
      lines.push(`DUE:${formatICSDate(event.due)}`);
    }

    if (event.status) {
      lines.push(`STATUS:${event.status}`);
    }

    if (event.priority) {
      lines.push(`PRIORITY:${event.priority}`);
    }

    if (event.location) {
      lines.push(`LOCATION:${escapeICS(event.location)}`);
    }

    lines.push(`SUMMARY:${escapeICS(event.summary)}`);
    lines.push(`DESCRIPTION:${escapeICS(event.description)}`);
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

/**
 * Format date for ICS format
 */
function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Escape special characters for ICS format
 */
function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .substring(0, 2000); // Limit length
}

/**
 * Extract calendar events from mind map tree
 * Looks for nodes with due dates or task-related content
 */
function extractEventsFromTree(tree: MindMapTree): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const now = new Date();

  const traverse = (node: MindMapTree, depth: number = 0) => {
    // Extract due date from metadata or content
    let dueDate: Date | undefined;
    let status: CalendarEvent['status'];
    let priority: number | undefined;

    if (node.metadata?.dueDate) {
      dueDate = new Date(node.metadata.dueDate);
    }

    // Detect status from content
    const contentLower = node.content.toLowerCase();
    if ((node.metadata?.checked || node.metadata?.completed) || contentLower.includes('✓') || contentLower.includes('done')) {
      status = 'COMPLETED';
    } else if (contentLower.includes('in progress') || contentLower.includes('doing')) {
      status = 'IN-PROCESS';
    }

    // Detect priority from content or metadata
    if (node.metadata?.priority) {
      priority = node.metadata.priority;
    } else if (contentLower.includes('urgent') || contentLower.includes('asap')) {
      priority = 1;
    } else if (contentLower.includes('important')) {
      priority = 5;
    }

    // Create event if it looks like a task or has a due date
    const isTask =
      node.metadata?.task ||
      node.metadata?.checked !== undefined ||
      contentLower.match(/task|todo|deadline|due|deliverable/i);

    if (isTask || dueDate) {
      const start = dueDate || now;
      const end = dueDate ? new Date(dueDate.getTime() + 60 * 60 * 1000) : new Date(now.getTime() + 60 * 60 * 1000);

      events.push({
        summary: node.content,
        description: generateEventDescription(node, depth),
        location: node.metadata?.location,
        start,
        end,
        due: dueDate,
        status,
        priority,
      });
    }

    // Recursively process children
    if (node.children) {
      node.children.forEach(child => traverse(child, depth + 1));
    }
  };

  traverse(tree);
  return events;
}

/**
 * Generate event description from node context
 */
function generateEventDescription(node: MindMapTree, depth: number): string {
  const parts: string[] = [];

  if (node.metadata?.notes) {
    parts.push(`Notes: ${node.metadata.notes}`);
  }

  if (node.metadata?.link) {
    parts.push(`Link: ${node.metadata.link}`);
  }

  const childCount = node.children?.length || 0;
  if (childCount > 0) {
    parts.push(`Subtasks: ${childCount}`);
  }

  parts.push(`Mind Map Depth: ${depth}`);

  return parts.join('\\n');
}

/**
 * Generate Google Calendar URL for an event
 */
export function generateGoogleCalendarURL(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.summary,
    details: event.description.replace(/\\n/g, '\n'),
    dates: `${formatICSDate(event.start)}/${formatICSDate(event.end)}`,
  });

  if (event.location) {
    params.set('location', event.location);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Open Google Calendar with event from mind map node
 */
export function openInGoogleCalendar(tree: MindMapTree): void {
  const events = extractEventsFromTree(tree);

  if (events.length === 0) {
    alert('No task or deadline events found in the mind map.');
    return;
  }

  // Open first event in Google Calendar
  const url = generateGoogleCalendarURL(events[0]);
  window.open(url, '_blank');
}

/**
 * Export all tasks to Google Calendar (one by one)
 */
export function exportAllToGoogleCalendar(tree: MindMapTree): void {
  const events = extractEventsFromTree(tree);

  if (events.length === 0) {
    alert('No task or deadline events found in the mind map.');
    return;
  }

  if (events.length === 1) {
    window.open(generateGoogleCalendarURL(events[0]), '_blank');
  } else {
    // Open multiple events with delay
    let index = 0;
    const openNext = () => {
      if (index < events.length) {
        window.open(generateGoogleCalendarURL(events[index]), '_blank');
        index++;
        setTimeout(openNext, 500);
      }
    };
    openNext();
  }
}

/**
 * Generate summary of tasks in the mind map
 */
export function generateTaskSummary(tree: MindMapTree): {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  upcoming: number;
} {
  const summary = {
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    upcoming: 0,
  };

  const now = new Date();

  const traverse = (node: MindMapTree) => {
    const isTask =
      node.metadata?.task ||
      node.metadata?.checked !== undefined ||
      node.content.toLowerCase().match(/task|todo|deadline|due|deliverable/i);

    if (isTask) {
      summary.total++;

      if (node.metadata?.checked || node.metadata?.completed || node.content.includes('✓')) {
        summary.completed++;
      } else {
        summary.pending++;

        if (node.metadata?.dueDate) {
          const dueDate = new Date(node.metadata.dueDate);
          if (dueDate < now) {
            summary.overdue++;
          } else if (dueDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) {
            summary.upcoming++;
          }
        }
      }
    }

    if (node.children) {
      node.children.forEach(traverse);
    }
  };

  traverse(tree);
  return summary;
}

/**
 * Create calendar heatmap data
 * Returns array of { date: string, count: number }
 */
export function generateCalendarHeatmap(tree: MindMapTree): Array<{ date: string; count: number }> {
  const dateMap = new Map<string, number>();

  const traverse = (node: MindMapTree) => {
    if (node.metadata?.dueDate || node.metadata?.created) {
      const date = new Date(node.metadata.dueDate || node.metadata.created);
      const dateKey = date.toISOString().split('T')[0];
      dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
    }

    if (node.children) {
      node.children.forEach(traverse);
    }
  };

  traverse(tree);

  return Array.from(dateMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Export mind map timeline as CSV for calendar import
 */
export function exportToCSV(tree: MindMapTree, filename: string = 'mindmap-tasks.csv'): void {
  const events = extractEventsFromTree(tree);

  const headers = ['Subject', 'Start Date', 'Start Time', 'End Date', 'End Time', 'Description', 'Location', 'Status'];
  const rows = [headers];

  events.forEach(event => {
    rows.push([
      event.summary,
      event.start.toISOString().split('T')[0],
      event.start.toTimeString().slice(0, 5),
      event.end.toISOString().split('T')[0],
      event.end.toTimeString().slice(0, 5),
      event.description.replace(/\\n/g, ' '),
      event.location || '',
      event.status || 'NEEDS-ACTION',
    ]);
  });

  const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
