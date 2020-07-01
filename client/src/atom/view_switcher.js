import { set } from 'invary';
import React, { Children } from "react";

export default (props) => {
  let [children, setChildren] = React.useState(props.children);
  let [selected, setSelected] = React.useState(null);

  if (selected !== props.selected) {
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
