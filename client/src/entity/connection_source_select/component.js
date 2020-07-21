import React from 'react';
import { ActionList, PageSelector, Source, Select, ValueViewer, ViewSelector } from '../../atom';
import {
  readSourceSelectData,
  readSourceSelectFilter,
  sendSourceSelectFilterOffsetAction,
} from '../action';

const stub = {
  td: <td/>,
};
const style = {

};

function RowList(props) {
  if (!props.columns) {
    return null;
  }

  if (!props.result || props.result.length === 0) {
    return <div className='span success'>No data</div>;
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
        { makeRows(props.result, props.columns, props.limit || 20) }
      </tbody>
    </table>;
  } else {
    return <table>
      <thead>
        { props.columns.map((key) => <td>{ key }</td>) }
      </thead>
      <tbody>
        { makeRows(props.result, props.columns, props.limit || 20) }
      </tbody>
    </table>;
  }
};

function makeRows(rows, columns, limit) {
  const trStub = <tr><td colspan={ limit }>&nbsp;</td></tr>;

  rows = rows.map((row) => {
    return <tr>
      {
        columns.map((columnName) => {
          if (columnName in row) {
            return <td style={ style.td }><ValueViewer value={ row[columnName] }/></td>;
          } else {
            return stub.td;
          }
        })
      }
    </tr>;
  });

  if (rows.length < limit) {
    for (let i = rows.length; i < limit; i += 1) {
      rows.push(trStub);
    }
  }

  return rows;
}

export default (props) => {
  const { flow } = props;

  return <React.Fragment>
    <Source props={ [
      [readSourceSelectData(flow), '...'],
      [readSourceSelectFilter(flow), { limit: 'limit' }],
    ] }>
      <RowList/>
    </Source>
    <Source props={ [
      [readSourceSelectData(flow), { totalCount: 'total' }],
      [readSourceSelectFilter(flow), { limit: 'perPage', offset: 'value' }],
    ] }>
      <PageSelector onSelect={ sendSourceSelectFilterOffsetAction.bind(null, flow) } />
    </Source>
  </React.Fragment>;
};
