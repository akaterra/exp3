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
  content: {
    overflowX: 'scroll',
    width: '100%',
  },
  th: {
    textAlign: 'left',
  },
};

function RowList(props) {
  if (!props.columns) {
    return null;
  }

  if (!props.result || props.result.length === 0) {
    return <div className='span success'>No data</div>;
  }

  if (props.schemaless) {
    return <div style={ style.content }>
      <table>
        <thead>
          <tr>
            { props.columns.map((key) => <th style={ style.th }>{ key }</th>) }
          </tr>
        </thead>
        <tbody>
          { makeRows(props.result, props.columns, props.limit || 20) }
        </tbody>
      </table>
    </div>;
  } else {
    return <div style={ style.content }>
      <table>
        <thead>
          <tr>
            { props.columns.map((key) => <th style={ style.th }>{ key }</th>) }
          </tr>
        </thead>
        <tbody>
          { makeRows(props.result, props.columns, props.limit || 20) }
        </tbody>
      </table>
    </div>;
  }
};

function makeRows(rows, columns, limit) {
  const tdStub = <td colSpan={ limit }>&nbsp;</td>;

  rows = rows.map((row, i) => {
    return <tr key={ i }>
      {
        columns.map((columnName) => {
          if (columnName in row) {
            return <td key={ columnName } style={ style.td }><ValueViewer value={ row[columnName] }/></td>;
          } else {
            return stub.td;
          }
        })
      }
    </tr>;
  });

  if (rows.length < limit) {
    for (let i = rows.length; i < limit; i += 1) {
      rows.push(<tr key={ i }>{ tdStub }</tr>);
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
