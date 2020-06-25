import React from "react";
import { useLoader } from '../effect';

export default (props) => {
  let currentItems;

  if (props.source) {
    const [items, setItems] = React.useState([]);

    useLoader(() => props.source().then(setItems));

    currentItems = items;
  } else {
    currentItems = props.items;
  }

  return <select>
    { currentItems && currentItems.map((item, i) => <option key={ i }>{ item }</option>) }
  </select>;
};
