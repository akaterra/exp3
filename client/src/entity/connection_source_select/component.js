import React from 'react';
import { ActionList, Source, Select, ViewSwitcher } from '../../atom';

function RowList(props) {
  if (!props.columns) {
    return null;
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
};

export default (props) => {
  const { flow } = props;

  return <Source source={ flow.data } prop='...'>
    <RowList/>
  </Source>;
};
