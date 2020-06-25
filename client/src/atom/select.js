import React from "react";
import { useLoader } from '../effect';

export default (props) => {
  let currentItems;

  if (props.source) {
    const [items, setItems] = React.useState(props.items || []);

    useLoader(() => props.source().then((items) => {
      if (props.onChange) {
        props.onChange(items[0]);
      }

      return items;
    }).then(setItems));

    currentItems = items;
  } else {
    currentItems = props.items;
  }

  return <select
    onChange={ props.onChange && ((e) => {
      props.onChange(e.currentTarget.options[e.currentTarget.selectedIndex].value);
    }) }
  >
    { currentItems && currentItems.map((item, i) => <option key={ i }>{ item }</option>) }
  </select>;
};
