import React from 'react';
import { ActionList, Source, Select, ViewSwitcher } from '../../atom';
import { default as ConnectionSourceSelect } from '../connection_source_select';

export default (props) => {
  const { flow } = props;
  
  return <div className='row flex'>
    <div className='f-5'>
      <div className='row'>
      <Source props={ {
        items: flow.currentDbsNames,
        value: flow.currentDb,
      } }>
        <Select.WithLabel label='Database:' onChange={ (name) => flow.sendSelectCurrentDbAction(name) } />
      </Source>
      <Source props={ {
        items: flow.currentSchemasNames,
        value: flow.currentSchema,
      } }>
        <Select.WithLabel label='Schema:' onChange={ (name) => flow.sendSelectCurrentSchemaAction(name) } />
      </Source>
      <Source props={ {
        items: flow.currentSourcesNames,
        value: flow.currentSource,
      } }>
        <Select.WithLabel label='Source:' onChange={ (name) => flow.sendSelectCurrentSourceAction(name) } />
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
    </div>
    <div className='f15 flex-1'>
      <div className='row'>
      <Source source={ flow.mode } prop='view'>
        <ViewSwitcher>
          <ConnectionSourceSelect.Component flow={ flow } view='source'/>
        </ViewSwitcher>
      </Source>
      </div>
    </div>
  </div>;
};
