import React from "react";
import { ActionList, Form, Stream, Submit, ViewSwitcher } from '../../atom';
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
      <Stream source={ api.currentSchemas } to='items' field='schema' onChange={ (schema) => {
        api.selectCurrentSourcesFor(schema);
      } }>
        <Select.WithLabel label='schema' mapper={ _ => _.name } />
      </Stream>
      <Stream source={ api.currentSources } to='items' field='source' onChange={ (schema) => {
        // api.selectCurrentSourcesFor(schema);
      } }>
        <Select.WithLabel label='source' mapper={ _ => _.name } />
      </Stream>
      <Stream source={ api.scope } to='selected'>
        <ViewSwitcher>
          <Stream
            sources={ [
              [api.currentDbs, 'items'],
            ] }
            view='db:list'
          >
            <ActionList></ActionList>hello
          </Stream>
          <div/>
        </ViewSwitcher>
      </Stream>
      {/* <Stream source={ () => api.currentSources } to='items' field='source'>

      </Stream> */}
    </Form>
  </div>;
};

export { default as Auth } from './auth';
