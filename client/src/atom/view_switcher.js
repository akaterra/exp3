import { set } from 'invary';
import React, { Children } from "react";

export default (props) => {
  const children = Array.isArray(props.children) ? props.children : [props.children];

  return <div>
    { children.map((child) => {
      if (child.props.view === props.selected) {
        return child;
      } else {
        return null;
      }
    }) }
  </div>
};
