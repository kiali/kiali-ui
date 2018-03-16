import '../../app/App.css';

import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

const bookinfoData = require('./__stories__/bookinfo.json');

import CytoscapeLayout from './CytoscapeLayout';
import { ColaGraph } from './graphs/ColaGraph';

const stories = storiesOf('CytoscapeLayout', module);

stories.add('Bookinfo', () => {
  const mock = new MockAdapter(axios);
  mock.onAny().reply(200, bookinfoData);
  return (
    <CytoscapeLayout layout={ColaGraph.getLayout()} namespace="default" interval="30" onClick={action('onClick')} />
  );
});
