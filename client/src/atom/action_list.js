import { set, Arr } from 'invary';
import React, { Children } from "react";

export default (props) => {
  return props.items
    ? props.items.map(([name, action]) => {
      return <a style={ { display: 'block' } } onClick={ props.onSubmit && (() => props.onSubmit(action)) }>{ name }</a>;
    })
    : null;
};
