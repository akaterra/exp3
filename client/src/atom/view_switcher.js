import { set } from 'invary';
import React, { Children } from "react";

export default (props) => {
  let [children, setChildren] = React.useState(null);
  let [selected, setSelected] = React.useState(null);

  if (selected !== props.selected) {
    if (props.ignoreUnknown) {
      if (!props.children.some((child) => child.props.view === props.selected)) {
        return children;
      }
    }

    children = props.children;
    selected = props.selected;

    if (!Array.isArray(children)) {
      children = [children];
    }

    children = children.map((child, index) => {
      if (child.props.view === selected) {
        return child;
      } else {
        return <div key={ index } style={ { display: 'none' } }>{ child }</div>;
      }
    });

    setChildren(children);
    setSelected(selected);
  }

  return children;
};
