import { set, Arr } from 'invary';
import React, { Children } from "react";

export default (props) => {
  if (!props.items) {
    return null;
  }

  return props.items.map(([name, action], i) => {
    return <a
      key={ i }
      style={ { display: 'block' } }
      onClick={ props.onSubmit && (() => props.onSubmit(action)) }
    >
      { name }
    </a>;
  });
};
