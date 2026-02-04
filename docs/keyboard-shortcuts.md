# Keyboard Shortcuts Reference

Complete reference of all keyboard shortcuts available in the Mind Map Web Application. All shortcuts are designed to be accessible and follow WCAG 2.1 AA guidelines for keyboard navigation.

## Accessibility Notes

- **All shortcuts** are keyboard-accessible and work with screen readers
- **No mouse-only interactions** - everything can be done with keyboard
- **Focus indicators** are visible for all interactive elements
- **Logical tab order** ensures smooth keyboard navigation
- **Escape key** closes all modals and panels

## Core Mind Map Operations

### Node Creation & Editing

| Shortcut               | Action                               | Description                                     | Accessibility Notes                                               |
| ---------------------- | ------------------------------------ | ----------------------------------------------- | ----------------------------------------------------------------- |
| `Tab`                  | Create child node                    | Adds a new child node to the selected node      | Focus moves to new node, announced by screen reader               |
| `Enter`                | Create sibling node                  | Adds a new sibling node after the selected node | Focus moves to new node, announced by screen reader               |
| `Delete` / `Backspace` | Delete selected node                 | Removes the selected node and its children      | Confirmation dialog for accessibility                             |
| `E`                    | Edit node text                       | Enters edit mode for the selected node          | Focus moves to text input, ARIA live region announces edit mode   |
| `F2`                   | Edit node text (alternative)         | Alternative shortcut for editing node text      | Same as `E` key                                                   |
| `Space`                | Toggle collapse/expand               | Collapses or expands the selected node branch   | ARIA expanded state updated, screen reader announces state change |
| `Ctrl + Space`         | Toggle collapse/expand (alternative) | Alternative shortcut for toggling collapse      | Same as `Space` key                                               |

### Node Selection & Navigation

| Shortcut           | Action                  | Description                                 | Accessibility Notes                                                  |
| ------------------ | ----------------------- | ------------------------------------------- | -------------------------------------------------------------------- |
| `Arrow Up`         | Select previous node    | Moves selection to the node above           | Focus moves, screen reader announces node content                    |
| `Arrow Down`       | Select next node        | Moves selection to the node below           | Focus moves, screen reader announces node content                    |
| `Arrow Left`       | Select parent node      | Moves selection to the parent node          | Focus moves, screen reader announces node content                    |
| `Arrow Right`      | Select first child node | Moves selection to the first child node     | Focus moves, screen reader announces node content                    |
| `Shift + Click`    | Multi-select nodes      | Adds nodes to selection while holding Shift | ARIA selected state updated for all selected nodes                   |
| `Ctrl + A`         | Select all nodes        | Selects all nodes on the canvas             | ARIA selected state updated, screen reader announces selection count |
| `Ctrl + Shift + A` | Clear selection         | Deselects all nodes                         | ARIA selected state cleared, screen reader announces                 |

### Canvas Navigation

| Shortcut             | Action                | Description                       | Accessibility Notes                                 |
| -------------------- | --------------------- | --------------------------------- | --------------------------------------------------- |
| `Ctrl +`             | Zoom in               | Increases zoom level by 10%       | ARIA live region announces zoom level change        |
| `Ctrl -`             | Zoom out              | Decreases zoom level by 10%       | ARIA live region announces zoom level change        |
| `Ctrl 0`             | Fit view to all nodes | Zooms and pans to show all nodes  | ARIA live region announces view change              |
| `Ctrl + Mouse Wheel` | Zoom with mouse wheel | Alternative zoom method           | Works with keyboard alternatives                    |
| `Middle Mouse Drag`  | Pan canvas            | Drag to move around the canvas    | Works with keyboard alternatives (arrow keys)       |
| `Shift + Mouse Drag` | Select area           | Select multiple nodes by dragging | Works with keyboard alternatives (Shift+arrow keys) |

## Search & Find

| Shortcut           | Action                               | Description                              | Accessibility Notes                                       |
| ------------------ | ------------------------------------ | ---------------------------------------- | --------------------------------------------------------- |
| `Ctrl + F`         | Open search panel                    | Opens the advanced search panel          | Focus moves to search input, ARIA live region announces   |
| `Ctrl + G`         | Next search result                   | Navigates to next search result          | Focus moves to found node, screen reader announces result |
| `Ctrl + Shift + G` | Previous search result               | Navigates to previous search result      | Focus moves to found node, screen reader announces result |
| `F3`               | Next search result (alternative)     | Alternative shortcut for next result     | Same as `Ctrl + G`                                        |
| `Shift + F3`       | Previous search result (alternative) | Alternative shortcut for previous result | Same as `Ctrl + Shift + G`                                |
| `Escape`           | Close search panel                   | Closes the search panel                  | Focus returns to previously focused element               |

## Editing & History

| Shortcut           | Action             | Description                             | Accessibility Notes                    |
| ------------------ | ------------------ | --------------------------------------- | -------------------------------------- |
| `Ctrl + Z`         | Undo               | Reverts the last change                 | ARIA live region announces undo action |
| `Ctrl + Y`         | Redo               | Re-applies the last undone change       | ARIA live region announces redo action |
| `Ctrl + Shift + Z` | Redo (alternative) | Alternative shortcut for redo           | Same as `Ctrl + Y`                     |
| `Ctrl + S`         | Manual save        | Forces a manual save to localStorage    | ARIA live region announces save status |
| `Ctrl + Shift + S` | Save as...         | Opens save dialog for different formats | Focus moves to save dialog             |
| `Ctrl + O`         | Open file          | Opens file import dialog                | Focus moves to file input              |

## Panel Management

### Core Panels

| Shortcut           | Action                    | Description                                      | Accessibility Notes                                |
| ------------------ | ------------------------- | ------------------------------------------------ | -------------------------------------------------- |
| `Ctrl + M`         | Toggle metadata panel     | Shows/hides node metadata (icons, clouds, links) | Focus moves to panel, ARIA expanded state updated  |
| `Ctrl + N`         | Toggle notes panel        | Shows/hides rich text notes editor               | Focus moves to editor, ARIA expanded state updated |
| `Ctrl + H`         | Toggle save history panel | Shows/hides auto-save history                    | Focus moves to panel, ARIA expanded state updated  |
| `Ctrl + Shift + H` | Toggle undo/redo history  | Shows/hides visual history timeline              | Focus moves to panel, ARIA expanded state updated  |
| `Ctrl + I`         | Toggle statistics panel   | Shows/hides mind map statistics                  | Focus moves to panel, ARIA expanded state updated  |

### Advanced Features Panels

| Shortcut           | Action                   | Description                              | Accessibility Notes                               |
| ------------------ | ------------------------ | ---------------------------------------- | ------------------------------------------------- |
| `Ctrl + Shift + A` | Toggle AI Assistant      | Shows/hides AI-powered features panel    | Focus moves to panel, ARIA expanded state updated |
| `Ctrl + Shift + C` | Toggle comments          | Shows/hides collaborative comments panel | Focus moves to panel, ARIA expanded state updated |
| `Ctrl + Shift + W` | Toggle webhooks          | Shows/hides webhook integration panel    | Focus moves to panel, ARIA expanded state updated |
| `Ctrl + Shift + D` | Toggle calendar export   | Shows/hides calendar export panel        | Focus moves to panel, ARIA expanded state updated |
| `Ctrl + Shift + E` | Toggle email integration | Shows/hides email integration panel      | Focus moves to panel, ARIA expanded state updated |

### Visualization & Presentation Panels

| Shortcut           | Action                   | Description                               | Accessibility Notes                                            |
| ------------------ | ------------------------ | ----------------------------------------- | -------------------------------------------------------------- |
| `Ctrl + Shift + P` | Toggle presentation mode | Enters/exits fullscreen presentation mode | Focus trapped in presentation, ARIA live region announces mode |
| `Ctrl + Shift + 3` | Toggle 3D view           | Shows/hides 3D visualization of mind map  | Focus moves to 3D view, ARIA expanded state updated            |
| `Ctrl + Shift + T` | Toggle templates         | Shows/hides template selection panel      | Focus moves to panel, ARIA expanded state updated              |
| `Ctrl + Shift + ;` | Toggle theme settings    | Shows/hides theme customization panel     | Focus moves to panel, ARIA expanded state updated              |
| `Ctrl + Shift + L` | Toggle dark mode         | Toggles between light and dark themes     | ARIA live region announces theme change                        |

## Presentation Mode Shortcuts

When in presentation mode (`Ctrl + Shift + P`):

| Shortcut                          | Action            | Description                              | Accessibility Notes                               |
| --------------------------------- | ----------------- | ---------------------------------------- | ------------------------------------------------- |
| `Right Arrow` / `Space` / `Enter` | Next slide        | Advances to next presentation slide      | ARIA live region announces slide title and number |
| `Left Arrow` / `Backspace`        | Previous slide    | Goes back to previous presentation slide | ARIA live region announces slide title and number |
| `Home`                            | First slide       | Jumps to first presentation slide        | ARIA live region announces slide title and number |
| `End`                             | Last slide        | Jumps to last presentation slide         | ARIA live region announces slide title and number |
| `N`                               | Toggle notes      | Shows/hides speaker notes                | ARIA expanded state updated for notes             |
| `O`                               | Toggle overview   | Shows/hides slide overview               | ARIA expanded state updated for overview          |
| `F`                               | Toggle fullscreen | Toggles fullscreen mode                  | ARIA live region announces fullscreen state       |
| `Escape`                          | Exit presentation | Returns to normal editing mode           | Focus returns to previously focused element       |

## 3D View Shortcuts

When in 3D view (`Ctrl + Shift + 3`):

| Shortcut            | Action             | Description                         | Accessibility Notes                             |
| ------------------- | ------------------ | ----------------------------------- | ----------------------------------------------- |
| `W` / `Arrow Up`    | Move forward       | Moves camera forward in 3D space    | ARIA live region announces camera position      |
| `S` / `Arrow Down`  | Move backward      | Moves camera backward in 3D space   | ARIA live region announces camera position      |
| `A` / `Arrow Left`  | Move left          | Moves camera left in 3D space       | ARIA live region announces camera position      |
| `D` / `Arrow Right` | Move right         | Moves camera right in 3D space      | ARIA live region announces camera position      |
| `Q`                 | Move up            | Moves camera up in 3D space         | ARIA live region announces camera position      |
| `E`                 | Move down          | Moves camera down in 3D space       | ARIA live region announces camera position      |
| `Mouse Drag`        | Rotate view        | Rotates camera by dragging mouse    | Works with keyboard alternatives (arrow keys)   |
| `Mouse Wheel`       | Zoom               | Zooms in/out in 3D view             | Works with keyboard alternatives (`+`/`-` keys) |
| `R`                 | Reset view         | Resets camera to default position   | ARIA live region announces view reset           |
| `T`                 | Toggle auto-rotate | Enables/disables automatic rotation | ARIA live region announces auto-rotate state    |

## File Operations

| Shortcut           | Action             | Description                             | Accessibility Notes                          |
| ------------------ | ------------------ | --------------------------------------- | -------------------------------------------- |
| `Ctrl + N`         | New mind map       | Creates a new empty mind map            | Confirmation dialog if unsaved changes exist |
| `Ctrl + O`         | Open mind map      | Opens file import dialog                | Focus moves to file input                    |
| `Ctrl + S`         | Save mind map      | Saves to localStorage                   | ARIA live region announces save status       |
| `Ctrl + Shift + S` | Save as...         | Opens save dialog for different formats | Focus moves to save dialog                   |
| `Ctrl + P`         | Print / Export PDF | Opens print/PDF export dialog           | Focus moves to print dialog                  |
| `Ctrl + E`         | Export menu        | Opens export format selection           | Focus moves to export menu                   |

## Import/Export Format Shortcuts

When in export dialog:

| Shortcut | Action                   | Description                    | Accessibility Notes                      |
| -------- | ------------------------ | ------------------------------ | ---------------------------------------- |
| `1`      | Export as JSON           | Exports in native JSON format  | ARIA live region announces export format |
| `2`      | Export as FreeMind (.mm) | Exports in FreeMind XML format | ARIA live region announces export format |
| `3`      | Export as OPML           | Exports in OPML outline format | ARIA live region announces export format |
| `4`      | Export as Markdown       | Exports as indented markdown   | ARIA live region announces export format |
| `5`      | Export as YAML           | Exports in YAML format         | ARIA live region announces export format |
| `6`      | Export as D2             | Exports in D2 diagram format   | ARIA live region announces export format |
| `7`      | Export as SVG            | Exports as vector graphics     | ARIA live region announces export format |
| `8`      | Export as PNG            | Exports as raster image        | ARIA live region announces export format |
| `9`      | Export as PDF            | Exports as PDF document        | ARIA live region announces export format |

## Accessibility-Specific Shortcuts

| Shortcut          | Action                             | Description                                   | Accessibility Notes                        |
| ----------------- | ---------------------------------- | --------------------------------------------- | ------------------------------------------ |
| `Ctrl + U`        | Toggle high contrast mode          | Increases color contrast for visibility       | ARIA live region announces contrast mode   |
| `Ctrl + +`        | Increase text size                 | Increases all text sizes by 10%               | ARIA live region announces text size       |
| `Ctrl + -`        | Decrease text size                 | Decreases all text sizes by 10%               | ARIA live region announces text size       |
| `Ctrl + 0`        | Reset text size                    | Resets text sizes to default                  | ARIA live region announces text size reset |
| `Alt + Shift + S` | Toggle screen reader announcements | Shows/hides screen reader announcements panel | Focus moves to announcements panel         |
| `Alt + Shift + K` | Show keyboard shortcuts            | Opens this keyboard shortcuts reference       | Focus moves to shortcuts dialog            |

## Mobile/Touch Gestures

For touch devices, these gestures are available:

| Gesture              | Action          | Description                  | Accessibility Alternative        |
| -------------------- | --------------- | ---------------------------- | -------------------------------- |
| **Tap**              | Select node     | Selects a node               | Keyboard navigation (arrow keys) |
| **Double tap**       | Edit node       | Enters edit mode for node    | `E` or `F2` key                  |
| **Long press**       | Context menu    | Opens context menu for node  | Right-click or `Menu` key        |
| **Pinch**            | Zoom            | Zooms in/out on canvas       | `Ctrl +` / `Ctrl -` keys         |
| **Two-finger drag**  | Pan             | Moves around the canvas      | Arrow keys or middle mouse drag  |
| **Swipe left/right** | Navigate panels | Switches between open panels | `Tab` key between panels         |

## Help & Documentation

| Shortcut           | Action                     | Description                              | Accessibility Notes                      |
| ------------------ | -------------------------- | ---------------------------------------- | ---------------------------------------- |
| `F1`               | Open help                  | Opens help documentation                 | Focus moves to help dialog               |
| `?`                | Show keyboard shortcuts    | Shows this keyboard shortcuts reference  | Focus moves to shortcuts dialog          |
| `Ctrl + /`         | Toggle tooltips            | Shows/hides tooltips for all UI elements | ARIA live region announces tooltip state |
| `Ctrl + Shift + /` | Toggle accessibility hints | Shows/hides accessibility hints          | ARIA live region announces hints state   |

## Customizing Shortcuts

### View Current Shortcuts

Press `?` or go to **Help → Keyboard Shortcuts** to see all available shortcuts.

### Reset to Defaults

If you've customized shortcuts and want to reset:

1. Go to **Settings → Keyboard Shortcuts**
2. Click **Reset to Defaults**
3. Confirm the reset

### Browser-Specific Notes

- **macOS**: Use `Cmd` instead of `Ctrl` for most shortcuts
- **Linux**: All shortcuts work as documented
- **Windows**: All shortcuts work as documented
- **Screen Readers**: All shortcuts are announced properly

## Accessibility Testing

All keyboard shortcuts have been tested for accessibility:

- ✅ **Keyboard navigation**: All shortcuts work with keyboard only
- ✅ **Screen reader compatibility**: All actions are announced properly
- ✅ **Focus management**: Focus moves logically between elements
- ✅ **No keyboard traps**: Escape key always exits modals
- ✅ **Logical tab order**: Tab navigation follows visual layout

## Troubleshooting

### Shortcuts Not Working

1. **Check focus**: Ensure the canvas or relevant element has focus
2. **Check modifiers**: Some shortcuts require `Ctrl`, `Shift`, or `Alt`
3. **Browser conflicts**: Some browsers have conflicting shortcuts
4. **Extensions**: Browser extensions may interfere with shortcuts

### Customizing for Accessibility Needs

1. Go to **Settings → Accessibility**
2. Adjust shortcut preferences
3. Enable/disable specific shortcut categories
4. Set custom shortcuts for frequent actions

## Contributing New Shortcuts

When adding new keyboard shortcuts:

1. **Follow existing patterns**: Use consistent modifier key combinations
2. **Test accessibility**: Ensure screen readers announce actions
3. **Document thoroughly**: Add to this reference document
4. **Provide alternatives**: Include mouse/touch alternatives
5. **Avoid conflicts**: Check for existing shortcut conflicts

---

**Last Updated**: 2026-02-04  
**WCAG Compliance**: 2.1 AA  
**Test Coverage**: All shortcuts tested with keyboard and screen readers
