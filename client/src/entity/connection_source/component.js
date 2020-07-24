import React from 'react';
import { ActionList, Source, Select, ViewSelector } from '../../atom';
import { readMode, readSource } from '../action';

export default (props) => {
  const { flow } = props;

  return <Source props={ [
    [readMode(flow), 'view'],
    [readSource(flow), '...', (data) => ({
      switchers: {
        'source:details': 'Details',
        'source:select': 'Select data',
        'source:insert': 'Insert data',
        'source:structure': 'Structure',
        'source:indexes': 'Indexes',
      },
    })],
  ] }>
    <ViewSelector switchers={{
      'source:details': 'Details',
      'source:select': 'Select data',
      'source:insert': 'Insert data',
      'source:structure': 'Structure',
      'source:indexes': 'Indexes',
    }}>
      <div view='source:statistic'></div>
      <div view='source:select'></div>
      <div view='source:alter'></div>
    </ViewSelector>
  </Source>;
};
