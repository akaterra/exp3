import { set } from 'invary';
import React, { Children } from "react";

export default (props) => {
  let [children, setChildren] = React.useState(null);
  let [view, setView] = React.useState(null);

  if (view !== props.view) {
    if (props.ignoreUnknown) {
      if (!props.children.some((child) => child.props.view === props.view)) {
        return children;
      }
    }

    children = props.children;
    view = props.view;

    if (!Array.isArray(children)) {
      children = [children];
    }

    children = children.map((child, index) => {
      if (child.props.view === view) {
        return child;
      } else {
        return <div key={ index } style={ { display: 'none' } }>{ child }</div>;
      }
    });

    setChildren(children);
    setView(view);
  }

  return children;
};
