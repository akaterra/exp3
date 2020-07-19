import React from 'react';
import { ActionList, Source, Select, ViewSwitcher } from '../../atom';
import { default as ConnectionSource } from '../connection_source';
import { default as ConnectionSourceSelect } from '../connection_source_select';

const style = {
  menu: {
    width: '300px',
  },
  menuList: {
    overflowY: 'auto',
  },
  main: {
    overflowX: 'auto',
  },
};

export default (props) => {
  const { flow } = props;
  
  return <div className='row flex'>
    <div className='ccc' style={ style.menu }>
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
              value: flow.currentDb,
            } }
            view='db:list'
          >
            <ActionList onSubmit={ (name) => flow.sendSelectCurrentDbAction(name) }></ActionList>
          </Source>
          <Source
            props={ {
              items: [flow.currentSchemasNames, _ => _.map(_ => [_, _])],
              value: flow.currentSchema,
            } }
            view='schema:list'
          >
            <ActionList onSubmit={ (name) => flow.sendSelectCurrentSchemaAction(name) }></ActionList>
          </Source>
          <Source
            props={ {
              items: [flow.currentSourcesNames, _ => _.map(_ => [_, _])],
              value: flow.currentSource,
            } }
            view='source:list'
          >
            <ActionList onSubmit={ (name) => flow.sendSelectCurrentSourceAction(name) }></ActionList>
          </Source>
        </ViewSwitcher>
      </Source>
      </div>
    </div>
    <div className='ccc flex-1' style={ style.main }>
      <div className='row'>
      <Source source={ flow.mode } prop='view'>
        <ViewSwitcher ignoreUnknown>
          <div view='db'></div>
          <div view='schema'></div>
          <ConnectionSource.Component flow={ flow } view='source'/>
          <ConnectionSourceSelect.Component flow={ flow } view='source'/>
        </ViewSwitcher>
      </Source>
      </div>
    </div>
  </div>;
};