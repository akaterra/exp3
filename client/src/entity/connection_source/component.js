import React from 'react';
import { ActionList, Source, Select, ViewSelector } from '../../atom';
import { readMode, readSource, sendMode } from '../action';
import { default as ConnectionSourceSelect } from '../connection_source_select';

export default (props) => {
  const { flow } = props;

  return <Source props={ [
    [readMode(flow), 'view'],
    [readSource(flow), '...', (data) => ({
      switchers: {
        'source:status': 'Status',
        'source:select': 'Select data',
        'source:insert': 'Insert data',
        'source:structure': 'Structure',
      },
    })],
  ] }>
    <ViewSelector
      switchers={ {
        'source:status': 'Status',
        'source:select': 'Select data',
        'source:insert': 'Insert data',
        'source:structure': 'Structure',
      } }
      onChange={ sendMode.bind(null, flow) }
    >
      <div view='source:statistic'></div>
      <ConnectionSourceSelect.Component view='source:select' flow={ flow }/>
      <div view='source:structure'></div>
    </ViewSelector>
  </Source>;
};
