/**
 * FreeMind icon definitions
 * Based on FreeMind's built-in icon set
 */

export interface FreeMindIcon {
  id: string
  emoji: string
  name: string
  category: 'status' | 'priority' | 'progress' | 'emotion' | 'time' | 'other'
}

export const FREE_MIND_ICONS: FreeMindIcon[] = [
  // Status icons
  { id: 'yes', emoji: '✅', name: 'Yes', category: 'status' },
  { id: 'no', emoji: '❌', name: 'No', category: 'status' },
  { id: 'help', emoji: '❓', name: 'Question', category: 'status' },
  { id: 'idea', emoji: '💡', name: 'Idea', category: 'status' },
  { id: 'important', emoji: '⭐', name: 'Important', category: 'status' },
  { id: 'wizard', emoji: '🧙', name: 'Wizard', category: 'status' },
  { id: 'warning', emoji: '⚠️', name: 'Warning', category: 'status' },
  { id: 'flag', emoji: '🚩', name: 'Flag', category: 'status' },
  { id: 'button_ok', emoji: '🆗', name: 'OK', category: 'status' },
  { id: 'button_cancel', emoji: '🚫', name: 'Cancel', category: 'status' },
  { id: 'checked', emoji: '☑️', name: 'Checked', category: 'status' },
  { id: 'unchecked', emoji: '☐', name: 'Unchecked', category: 'status' },

  // Priority icons
  { id: 'full-1', emoji: '🔴', name: 'Priority 1', category: 'priority' },
  { id: 'full-2', emoji: '🟠', name: 'Priority 2', category: 'priority' },
  { id: 'full-3', emoji: '🟡', name: 'Priority 3', category: 'priority' },
  { id: 'full-4', emoji: '🟢', name: 'Priority 4', category: 'priority' },
  { id: 'full-5', emoji: '🔵', name: 'Priority 5', category: 'priority' },
  { id: 'full-6', emoji: '🟣', name: 'Priority 6', category: 'priority' },
  { id: 'full-7', emoji: '⚫', name: 'Priority 7', category: 'priority' },
  { id: 'full-8', emoji: '⚪', name: 'Priority 8', category: 'priority' },

  // Progress icons
  { id: '0%', emoji: '0%', name: '0%', category: 'progress' },
  { id: '25%', emoji: '¼', name: '25%', category: 'progress' },
  { id: '50%', emoji: '½', name: '50%', category: 'progress' },
  { id: '75%', emoji: '¾', name: '75%', category: 'progress' },
  { id: '100%', emoji: '✓', name: '100%', category: 'progress' },

  // Emotion icons
  { id: 'smiley-neutral', emoji: '😐', name: 'Neutral', category: 'emotion' },
  { id: 'smiley-good', emoji: '🙂', name: 'Good', category: 'emotion' },
  { id: 'smiley-bad', emoji: '🙁', name: 'Bad', category: 'emotion' },
  { id: 'smiley-oh', emoji: '😮', name: 'Oh', category: 'emotion' },
  { id: 'heart', emoji: '❤️', name: 'Heart', category: 'emotion' },
  { id: 'broken-heart', emoji: '💔', name: 'Broken Heart', category: 'emotion' },
  { id: 'thumbs_up', emoji: '👍', name: 'Thumbs Up', category: 'emotion' },
  { id: 'thumbs_down', emoji: '👎', name: 'Thumbs Down', category: 'emotion' },
  { id: 'clanbomber', emoji: '💣', name: 'Bomb', category: 'other' },

  // Time icons
  { id: 'clock', emoji: '⏰', name: 'Clock', category: 'time' },
  { id: 'calendar', emoji: '📅', name: 'Calendar', category: 'time' },
  { id: 'hourglass', emoji: '⏳', name: 'Hourglass', category: 'time' },

  // Other common icons
  { id: 'forward', emoji: '▶️', name: 'Forward', category: 'other' },
  { id: 'back', emoji: '◀️', name: 'Back', category: 'other' },
  { id: 'up', emoji: '🔼', name: 'Up', category: 'other' },
  { id: 'down', emoji: '🔽', name: 'Down', category: 'other' },
  { id: 'folder', emoji: '📁', name: 'Folder', category: 'other' },
  { id: 'desktopnew', emoji: '🖥️', name: 'Desktop', category: 'other' },
  { id: 'kde', emoji: '🐧', name: 'KDE', category: 'other' },
  { id: 'gnome', emoji: '🐭', name: 'GNOME', category: 'other' },
  { id: 'linux', emoji: '🐧', name: 'Linux', category: 'other' },
  { id: 'mail', emoji: '✉️', name: 'Mail', category: 'other' },
  { id: 'info', emoji: 'ℹ️', name: 'Info', category: 'other' },
  { id: 'list', emoji: '📋', name: 'List', category: 'other' },
  { id: 'music', emoji: '🎵', name: 'Music', category: 'other' },
  { id: 'password', emoji: '🔑', name: 'Password', category: 'other' },
  { id: 'pencil', emoji: '✏️', name: 'Pencil', category: 'other' },
  { id: 'xmag', emoji: '🔍', name: 'Search', category: 'other' },
]

export const ICON_CATEGORIES = [
  { id: 'status', name: 'Status', icons: FREE_MIND_ICONS.filter(i => i.category === 'status') },
  {
    id: 'priority',
    name: 'Priority',
    icons: FREE_MIND_ICONS.filter(i => i.category === 'priority'),
  },
  {
    id: 'progress',
    name: 'Progress',
    icons: FREE_MIND_ICONS.filter(i => i.category === 'progress'),
  },
  { id: 'emotion', name: 'Emotion', icons: FREE_MIND_ICONS.filter(i => i.category === 'emotion') },
  { id: 'time', name: 'Time', icons: FREE_MIND_ICONS.filter(i => i.category === 'time') },
  { id: 'other', name: 'Other', icons: FREE_MIND_ICONS.filter(i => i.category === 'other') },
]

/**
 * Get emoji for icon ID
 */
export function getIconEmoji(iconId: string): string {
  const icon = FREE_MIND_ICONS.find(i => i.id === iconId)
  return icon?.emoji || ''
}
