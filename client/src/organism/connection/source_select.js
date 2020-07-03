import React from "react";
import { Form, Source, Submit } from '../../atom';
import { withApi } from '../../hoc';
import { Input, Password, Select } from '../../molecule';

export default (props) => {
  if (!props.columns) {
    return <div></div>;
  }

  const columnIndexes = props.columns.reduce((acc, [key, ind]) => {
    acc[key] = ind;

    return acc;
  }, {});

  return <table>
    <tr>
      { props.columns.map((key) => <th>{ key }</th>) }
    </tr>
  </table>;
}
