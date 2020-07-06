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
  const app = props.api;

  return <div className='row'>
    <div className='c-3'>
      <Source props={ {
        items: app.currentDbsNames,
        value: app.currentDb,
      } }>
        <Select.WithLabel label='db' onChange={ (name) => app.actSelectCurrentDb(name) } />
      </Source>
      <Source props={ {
        items: app.currentSchemasNames,
        value: app.currentSchema,
      } }>
        <Select.WithLabel label='schema' onChange={ (name) => app.actSelectCurrentSchema(name) } />
      </Source>
      <Source props={ {
        items: app.currentSourcesNames,
        value: app.currentSource,
      } }>
        <Select.WithLabel label='source' onChange={ (name) => app.actSelectCurrentSource(name) } />
      </Source>
      <Source source={ app.mode } prop='view'>
        <ViewSwitcher ignoreUnknown>
          <Source
            props={ {
              items: [app.currentDbsNames, _ => _.map(_ => [_, _])],
            } }
            view='db:list'
          >
            <ActionList onSubmit={ (name) => app.actSelectCurrentDb(name) }></ActionList>
          </Source>
          <Source
            props={ {
              items: [app.currentSchemasNames, _ => _.map(_ => [_, _])],
            } }
            view='schema:list'
          >
            <ActionList onSubmit={ (name) => app.actSelectCurrentSchema(name) }></ActionList>
          </Source>
          <Source
            props={ {
              items: [app.currentSourcesNames, _ => _.map(_ => [_, _])],
            } }
            view='source:list'
          >
            <ActionList onSubmit={ (name) => app.actSelectCurrentSource(name) }></ActionList>
          </Source>
        </ViewSwitcher>
      </Source>
    </div>
    <div className='c15'>

    </div>
  </div>;
};
