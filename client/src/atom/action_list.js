import { set } from 'invary';
import React, { Children } from "react";

export default (props) => {
  return props.items
    ? props.items.map(([name, action]) => {
      return <a href='#' onClick={ props.onSumbit && (() => props.onSumbit(action)) }>{ name }</a>;
    })
    : null;
};
