import React from 'react';
import { ActionList, Source, Select, ViewSwitcher } from '../../atom';
import { readMode } from '../action';

export default (props) => {
  const { flow } = props;

  return <Source source={ readMode(flow) } prop='view'>
    <ViewSwitcher>
      <div view='source:select'></div>
    </ViewSwitcher>
  </Source>;
};
