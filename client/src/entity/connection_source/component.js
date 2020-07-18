import React from 'react';
import { ActionList, Source, Select, ViewSwitcher } from '../../atom';
import { readMode } from '../action';

export default (props) => {
  const { flow } = props;

  return <Source source={ readMode(flow) } prop='view'>
    <ViewSwitcher switchers={{
      'source:statistic': 'Statistic',
      'source': 'Select',
      'source:alter': 'Alter schema',
    }}>
      <div view='source:statistic'></div>
      <div view='source:select'></div>
      <div view='source:alter'></div>
    </ViewSwitcher>
  </Source>;
};
