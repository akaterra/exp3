import React from "react";
import { ActionList, Form, Source, Submit, ViewSwitcher } from '../../atom';
import { Input, Password, Select } from '../../molecule';

export default (props) => {
  const api = props.api;

  return <div className='container'>
    <div>{ props.connection.name }</div>
    <div className='f1'>
      <Source props={ {
        items: api.currentDbsNames,
        value: api.currentDb,
      } }>
        <Select.WithLabel label='db' onChange={ (name) => api.actSelectCurrentDb(name) } />
      </Source>
      <Source props={ {
        items: api.currentSchemasNames,
        value: api.currentSchema,
      } }>
        <Select.WithLabel label='schema' onChange={ (name) => api.actSelectCurrentSchema(name) } />
      </Source>
      <Source props={ {
        items: api.currentSourcesNames,
        value: api.currentSource,
      } }>
        <Select.WithLabel label='source' onChange={ (name) => {} }/>
      </Source>
      <Source source={ api } to='selected'>
        <ViewSwitcher>
          <Source
            props={ {
              items: [api.currentDbsNames, _ => _.map(_ => [_, _])],
            } }
            view='db:list'
          >
            <ActionList onSubmit={ (name) => api.actSelectCurrentDb(name) }></ActionList>
          </Source>
          <Source
            props={ {
              items: [api.currentSchemasNames, _ => _.map(_ => [_, _])],
            } }
            view='schema:list'
          >
            <ActionList onSubmit={ (name) => api.actSelectCurrentSchema(name) }></ActionList>
          </Source>
          <Source
            props={ {
              items: [api.currentSourcesNames, _ => _.map(_ => [_, _])],
            } }
            view='source:list'
          >
            <ActionList onSubmit={ (name) => api.actSelectCurrentSource(name) }></ActionList>
          </Source>
        </ViewSwitcher>
      </Source>
      {/* <Stream source={ () => api.currentSources } to='items' field='source'>

      </Stream> */}
    </div>
  </div>;
};

export { default as Auth } from './auth';
