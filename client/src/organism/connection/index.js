import React from "react";
import { ActionList, Form, Source, Submit, ViewSwitcher } from '../../atom';
import { Input, Password, Select } from '../../molecule';

export { default as Auth } from './auth';
// export { default as SourceSelect } from './source_select';

function SourceSelect(props) {
  if (!props.columns) {
    return <div></div>;
  }

  const columnIndexes = props.columns.reduce((acc, key, ind) => {
    acc[key] = ind;

    return acc;
  }, {});

  if (props.schemaless) {
    return <table>
      <thead>
        { props.columns.map((key) => <td>{ key }</td>) }
      </thead>
      <tbody>
        { props.result.map((res) => {
          const arr = new Array(props.columns.length);

          for (const key of Object.keys(res)) {
            arr[columnIndexes[key]] = res[key];
          }

          arr.forEach((val, ind) => arr[ind] = <td>{ val !== undefined ? JSON.stringify(val) : null }</td>);

          return <tr>{ arr }</tr>;
        }) }
      </tbody>
    </table>;
  } else {
    return <table>
      <thead>
        { props.columns.map((key) => <td>{ key }</td>) }
      </thead>
      <tbody>
        { props.result.map((res) => {
          const arr = new Array(props.columns.length);

          for (const key of Object.keys(res)) {
            arr[columnIndexes[key]] = res[key];
          }

          arr.forEach((val, ind) => arr[ind] = <td>{ val !== undefined ? JSON.stringify(val) : null }</td>);

          return <tr>{ arr }</tr>;
        }) }
      </tbody>
    </table>;
  }
}

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
        <Select.WithLabel label='source' onChange={ (name) => api.actSelectCurrentSource(name) } />
      </Source>
      <Source source={ api } to='selected'>
        <ViewSwitcher ignoreUnknown>
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
    <div className='f5'>
      <Source source={ api } to='selected'>
        <ViewSwitcher>
          <Source
            props = { {
              '...': api.currentSourceSelect,
            } }
            component={ SourceSelect }
            view='source:select'
          />
        </ViewSwitcher>
      </Source>
    </div>
  </div>;
};
