import React from "react";
import { useLoader } from '../effect';

export default (props) => {
  let items = props.items;

  if (items) {
    const mapper = props.mapper;

    if (Array.isArray(items)) {
      items = items
        .map((item, i) => <option key={ i }>{ mapper ? mapper(item) : item }</option>);
    } else if (typeof items === 'object') {
      items = Object.entries(items)
        .map(([key, item]) => <option key={ key }>{ mapper ? mapper(item) : item }</option>);
    }
  }

  return <select
    onChange={ props.onChange && ((e) => {
      props.onChange(e.currentTarget.options[e.currentTarget.selectedIndex].value);
    }) }
  >
    { items }
  </select>;
};
