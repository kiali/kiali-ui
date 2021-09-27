import React from 'react';
import { Chip, Grid, GridItem } from '@patternfly/react-core';

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
    <>
      <GridItem span={5}>
        <Chip isReadOnly>{shortcut.shortcut}</Chip>
      </GridItem>
      <GridItem span={7}>
        <p>{shortcut.description}</p>
      </GridItem>
    </>
  );
};

const GraphShortcuts = (): JSX.Element => (
  <>
    <Grid gutter={'md'}>
      {shortcuts.map(
        (s: Shortcut): JSX.Element => {
          return makeShortcut(s);
        }
      )}
    </Grid>
  </>
);

export default GraphShortcuts;
