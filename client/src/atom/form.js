import { set } from 'invary';
import React from "react";

export default (props) => {
  let [params, setParams] = React.useState(props.state || {});
  let [children, setChildren] = React.useState(null);

  if (!children) {
    if (!props.children) {
      console.warn('At lease one child must be provided');

      return null;
    }

    children = (Array.isArray(props.children) ? props.children : [props.children]).map((child, i) => React.cloneElement(
      child,
      {
        key: i,
        field: props.field && child.props.field ? `${props.field}.${child.props.field}` : child.props.field,
        value: child.props.field ? params[child.props.field] : undefined,
        title: child.props.title,
        onChange: child.props.field && ((value) => {
          if (child.props.onChange) {
            child.props.onChange(value);
          }

          params = set(params, child.props.field, value);

          setParams(params);

          if (props.onChange) {
            props.onChange(params);
          }
        }),
        onSubmit: props.onSubmit && (() => {
          const result = props.onSubmit(params);
        }),
      },
    ));

    setChildren(children);
  }

  return <form { ...{ className: props.className, style: props.style } }>
    <div className='row'>
      { children }
    </div>
  </form>;
};
