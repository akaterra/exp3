import { set } from 'invary';
import React, { Children } from "react";

export default (props) => {
  const children = Array.isArray(props.children) ? props.children : [props.children];

  return children.map((child, index) => {
    if (child.props.view === props.selected) {
      return child;
    } else {
      return <div style={ { display: 'none' } }>{ child }</div>;
    }
  });
};
