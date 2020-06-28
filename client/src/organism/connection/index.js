import React from "react";
import { Form, Stream, Submit } from '../../atom';
import { Input, Password, Select } from '../../molecule';

export default (props) => {
  const api = props.api;

  return <div className='container'>
    <div>{ props.connection.name }</div>
    <div className='f1'>Menu</div>
    <div className='f5'>Content</div>
    <Form>
      <Stream source={ () => api.dbs() } to='items' field='db' onChange={ (db) => {
        api.selectCurrentSchemasFor(db);
      } }>
        <Select.WithLabel label='db' mapper={ _ => _.name } />
      </Stream>
      <Stream source={ () => api.currentSchemas } to='items' field='schema' onChange={ (schema) => {
        api.selectCurrentSourcesFor(schema);
      } }>
        <Select.WithLabel label='schema' mapper={ _ => _.name } />
      </Stream>
      <Stream source={ () => api.currentSources } to='items' field='source'>
        <Select.WithLabel label='source' mapper={ _ => _.name } />
      </Stream>
      <Stream source={ () => api.currentSources } to='items' field='source'>

      </Stream>
    </Form>
  </div>;
};

export { default as Auth } from './auth';
