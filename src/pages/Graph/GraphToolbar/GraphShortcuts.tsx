import React from 'react';
import { Chip } from '@patternfly/react-core';

interface Shortcut {
  shortcut: string;
  description: string;
}

const shortcuts: Shortcut[] = [
  { shortcut: 'Mouse wheel', description: 'Zoom' },
  { shortcut: 'Click + Drag', description: 'Panning' },
  { shortcut: 'Shift + Drag', description: 'Select zoom area' },
  { shortcut: 'Right click', description: 'Contextual menu on nodes' },
  { shortcut: 'Single click', description: 'Details in side panel on nodes and edges' },
  { shortcut: 'Double click', description: 'Drill into a node details graph' }
];

const makeShortcut = (shortcut: Shortcut): JSX.Element => {
  return (
    <tr>
      <td>
        <div style={{ marginLeft: '10px', marginBottom: '10px' }}>
          <Chip isReadOnly>{shortcut.shortcut}</Chip>
        </div>
      </td>
      <td style={{ marginLeft: '10px' }}>
        <div style={{ marginLeft: '10px', marginBottom: '10px' }}>{shortcut.description}</div>
      </td>
    </tr>
  );
};

const GraphShortcuts = (): JSX.Element => (
  <>
    <table style={{ margin: '10px' }}>
      {shortcuts.map(
        (s: Shortcut): JSX.Element => {
          return makeShortcut(s);
        }
      )}
    </table>
  </>
);

export default GraphShortcuts;
