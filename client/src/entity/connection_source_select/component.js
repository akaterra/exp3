import React from 'react';
import { ActionList, PageSelector, Source, Select, ValueViewer, ViewSwitcher } from '../../atom';
import {
  readSourceSelectData,
  readSourceSelectFilter,
  sendSourceSelectFilterOffsetAction,
} from '../action';

const stub = {
  td: <td/>,
};
const style = {
  td: {
    verticalAlign: 'top',
  },
};

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

          arr.forEach((val, ind) => arr[ind] = <td style={ style.td }><ValueViewer value={ val }/></td>);

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
          return <tr>
            {
              props.columns.map((columnName) => {
                if (columnName in res) {
                  return <td style={ style.td }><ValueViewer value={ res[columnName] }/></td>;
                } else {
                  return stub.td;
                }
              })
            }
          </tr>;
        }) }
      </tbody>
    </table>;
  }
};

export default (props) => {
  const { flow } = props;

  return <React.Fragment>
    <Source source={ readSourceSelectData(flow) } prop='...'>
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
