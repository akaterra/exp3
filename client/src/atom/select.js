import React from "react";
import { useLoader } from '../effect';

export default (props) => {
  let currentItems;

  if (props.source) {
    const [items, setItems] = React.useState(props.items || []);

    useLoader(() => props.source().then(setItems).then(() => {
      if (props.onChange) {
        props.onChange(items[0]);
      }
    }));

    currentItems = items;
  } else {
    currentItems = props.items;
  }

  return <select>
    { currentItems && currentItems.map((item, i) => <option key={ i }>{ item }</option>) }
  </select>;
};
