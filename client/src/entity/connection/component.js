import React from 'react';
import { Source, Select, ViewSelector } from '../../atom';
import { ActionList } from '../../molecule';
import { readMode } from '../action';
import { default as ConnectionSource } from '../connection_source';

const style = {
  content: {
    overflowX: 'auto',
  },
  menu: {
    width: '300px',
  },
  menuList: {
    overflowY: 'auto',
  },
};

export default (props) => {
  const { flow } = props;
  
  return <div className='row flex'>
    <div style={ style.menu }>
      <Source props={ {
        items: flow.currentDbsNames,
        value: flow.currentDb,
      } }>
        <Select.WithLabel className='c20' label='Database:' onChange={ (name) => flow.sendSelectCurrentDbAction(name) } />
      </Source>
      <Source props={ {
        items: flow.currentSchemasNames,
        value: flow.currentSchema,
      } }>
        <Select.WithLabel className='c20' label='Schema:' onChange={ (name) => flow.sendSelectCurrentSchemaAction(name) } />
      </Source>
      <Source props={ {
        items: flow.currentSourcesNames,
        value: flow.currentSource,
      } }>
        <Select.WithLabel className='c20' label='Source:' onChange={ (name) => flow.sendSelectCurrentSourceAction(name) } />
      </Source>
      <Source source={ readMode(flow) } prop='view'>
        <ViewSelector ignoreUnknown>
          <Source
            props={ {
              items: [flow.currentDbsNames, _ => _.map(_ => [_, _])],
              value: flow.currentDb,
            } }
            view='db:list'
          >
            <ActionList className='c20' onSubmit={ (name) => flow.sendSelectCurrentDbAction(name) }></ActionList>
          </Source>
          <Source
            props={ {
              items: [flow.currentSchemasNames, _ => _.map(_ => [_, _])],
              value: flow.currentSchema,
            } }
            view='schema:list'
          >
            <ActionList className='c20' onSubmit={ (name) => flow.sendSelectCurrentSchemaAction(name) }></ActionList>
          </Source>
          <Source
            props={ {
              items: [flow.currentSourcesNames, _ => _.map(_ => [_, _])],
              value: flow.currentSource,
            } }
            view='source:list'
          >
            <ActionList className='c20' onSubmit={ (name) => flow.sendSelectCurrentSourceAction(name) }></ActionList>
          </Source>
        </ViewSelector>
      </Source>
    </div>
    <div className='flex-1' style={ style.content }>
      <Source source={ readMode(flow) } prop='view'>
        <ViewSelector className='c20' ignoreUnknown>
          <div view='details'></div>
          <ConnectionSource.Component flow={ flow } view='source'/>
          <div view='db'></div>
          <div view='schema'></div>
        </ViewSelector>
      </Source>
      </div>
  </div>;
};
