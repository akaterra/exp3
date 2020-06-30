import React from "react";
import { ActionList, Form, Source, Submit, ViewSwitcher } from '../../atom';
import { Input, Password, Select } from '../../molecule';

export default (props) => {
  const api = props.api;

  return <div className='container'>
    <div>{ props.connection.name }</div>
    <Form className='f1'>
      <Source
        props={ {
          items: api.currentDbsNames,
          value: api.currentDb,
        } }
        field='db'
        onChange={ (name) => {
          api.actSelectCurrentDb(name);
        } }
      >
        <Select.WithLabel label='db' />
      </Source>
      <Source
        props={ {
          items: api.currentSchemasNames,
          value: api.currentSchema,
        } }
        field='schema'
        onChange={ (name) => {
          api.actSelectCurrentSchema(name);
        } }
      >
        <Select.WithLabel label='schema' />
      </Source>
      <Source
        props={ {
          items: api.currentSourcesNames,
          value: api.currentSource,
        } }
        field='source'
        onChange={ (name) => {
          // api.actSelectCurrentSource(name);
        } }
      >
        <Select.WithLabel label='source' />
      </Source>
      <Source source={ api } to='selected'>
        <ViewSwitcher>
          <Source
            props={ [
              [api.currentDbsNames, 'items', _ => _.map(_ => [_, _])],
            ] }
            view='db:list'
          >
            <ActionList onSubmit={ (name) => api.actSelectCurrentDb(name) }></ActionList>
          </Source>
          <Source
            props={ [
              [api.currentSchemasNames, 'items', _ => _.map(_ => [_, _])],
            ] }
            view='schema:list'
          >
            <ActionList onSubmit={ (name) => api.actSelectCurrentSchema(name) }></ActionList>
          </Source>
          <Source
            props={ [
              [api.currentSourcesNames, 'items', _ => _.map(_ => [_, _])],
            ] }
            view='source:list'
          >
            <ActionList onSubmit={ (name) => api.actSelectCurrentSource(name) }></ActionList>
          </Source>
        </ViewSwitcher>
      </Source>
      {/* <Stream source={ () => api.currentSources } to='items' field='source'>

      </Stream> */}
    </Form>
  </div>;
};

export { default as Auth } from './auth';
