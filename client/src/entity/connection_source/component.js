import React from 'react';
import { ActionList, Source, Select, ViewSelector } from '../../atom';
import { readMode } from '../action';

export default (props) => {
  const { flow } = props;

  return <Source source={ readMode(flow) } prop='view'>
    <ViewSelector switchers={{
      'source:Details': 'Details',
      'source': 'Select data',
      'source:insert': 'Insert data',
      'source:alter': 'Structure',
      'source:indexes': 'Indexes',
    }}>
      <div view='source:statistic'></div>
      <div view='source:select'></div>
      <div view='source:alter'></div>
    </ViewSelector>
  </Source>;
};
