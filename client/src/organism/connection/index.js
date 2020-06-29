import React from "react";
import { ActionList, Form, Source, Submit, ViewSwitcher } from '../../atom';
import { Input, Password, Select } from '../../molecule';

export default (props) => {
  const api = props.api;

  return <div className='container'>
    <div>{ props.connection.name }</div>
    <div className='f1'>Menu</div>
    <div className='f5'>Content</div>
    <Form>
      <Source
        source={ api.currentDbsNames }
        to='items' 
        field='db'
        onChange={ (db) => {
          api.selectCurrentSchemasFor(db);
        } }
      >
        <Select.WithLabel label='db' />
      </Source>
      <Source
        source={ api.currentSchemasNames }
        to='items'
        field='schema'
        onChange={ (schema) => {
          api.selectCurrentSourcesFor(schema);
        } }
      >
        <Select.WithLabel label='schema' />
      </Source>
      <Source
        source={ api.currentSourcesNames }
        to='items'
        field='source'
        onChange={ (schema) => {
          // api.selectCurrentSourcesFor(schema);
        } }
      >
        <Select.WithLabel label='source' />
      </Source>
      <Source source={ api.scope } to='selected'>
        <ViewSwitcher>
          <Source
            sources={ [
              [api.currentDbsNames, 'items', _ => _.map(_ => [_, _])],
            ] }
            view='db:list'
          >
            <ActionList></ActionList>
          </Source>
          <Source
            sources={ [
              [api.currentSchemasNames, 'items', _ => _.map(_ => [_, _])],
            ] }
            view='schema:list'
          >
            <ActionList></ActionList>
          </Source>
          <Source
            sources={ [
              [api.currentSourcesNames, 'items', _ => _.map(_ => [_, _])],
            ] }
            view='source:list'
          >
            <ActionList></ActionList>
          </Source>
        </ViewSwitcher>
      </Source>
      {/* <Stream source={ () => api.currentSources } to='items' field='source'>

      </Stream> */}
    </Form>
  </div>;
};

export { default as Auth } from './auth';
