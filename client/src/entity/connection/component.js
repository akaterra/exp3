import React from 'react';
import { ActionList, Source, Select, ViewSwitcher } from '../../atom';
import { default as ConnectionSourceSelect } from '../connection_source_select';

export default (props) => {
  const { flow } = props;
  
  return <div className='row'>
    <div className='c-3'>
      <Source props={ {
        items: flow.currentDbsNames,
        value: flow.currentDb,
      } }>
        <Select.WithLabel label='db' onChange={ (name) => flow.sendSelectCurrentDbAction(name) } />
      </Source>
      <Source props={ {
        items: flow.currentSchemasNames,
        value: flow.currentSchema,
      } }>
        <Select.WithLabel label='schema' onChange={ (name) => flow.sendSelectCurrentSchemaAction(name) } />
      </Source>
      <Source props={ {
        items: flow.currentSourcesNames,
        value: flow.currentSource,
      } }>
        <Select.WithLabel label='source' onChange={ (name) => flow.sendSelectCurrentSourceAction(name) } />
      </Source>
      <Source source={ flow.mode } prop='view'>
        <ViewSwitcher ignoreUnknown>
          <Source
            props={ {
              items: [flow.currentDbsNames, _ => _.map(_ => [_, _])],
            } }
            view='db:list'
          >
            <ActionList onSubmit={ (name) => flow.sendSelectCurrentDbAction(name) }></ActionList>
          </Source>
          <Source
            props={ {
              items: [flow.currentSchemasNames, _ => _.map(_ => [_, _])],
            } }
            view='schema:list'
          >
            <ActionList onSubmit={ (name) => flow.sendSelectCurrentSchemaAction(name) }></ActionList>
          </Source>
          <Source
            props={ {
              items: [flow.currentSourcesNames, _ => _.map(_ => [_, _])],
            } }
            view='source:list'
          >
            <ActionList onSubmit={ (name) => flow.sendSelectCurrentSourceAction(name) }></ActionList>
          </Source>
        </ViewSwitcher>
      </Source>
    </div>
    <div className='c15'>
      <Source source={ flow.mode } prop='view'>
        <ViewSwitcher>
          <ConnectionSourceSelect.Component flow={ flow } view='source'/>
        </ViewSwitcher>
      </Source>
    </div>
  </div>;
};
