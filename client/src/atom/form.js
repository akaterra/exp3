import { set } from 'invary';
import React from "react";

export default (props) => {
  let [params, setParams] = React.useState(props.state || {});
  const [l, setL] = React.useState(0);
  let [children, setChildren] = React.useState(null);

  if (!children) {
    if (!props.children) {
      throw new Error('At lease one child must be provided');
    }

    children = (Array.isArray(props.children) ? props.children : [props.children]).map((child, i) => React.cloneElement(
      child,
      {
        key: i,
        field: props.field && child.props.field ? `${props.field}.${child.props.field}` : child.props.field,
        value: child.props.field ? params[child.props.field] : undefined,
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
        onError: () => setL(l - 1),
        onLoaded: () => setL(l - 1),
        onLoading: () => setL(l + 1),
        onSubmit: props.onSubmit && (() => {
          setL(l + 1);

          const result = props.onSubmit(params);

          if (result instanceof Promise) {
            result.then(() => setL(l - 1)).catch((e) => {
              console.log(e);

              setL(l - 1);
            })
          } else {
            setL(l - 1);
          }
        }),
      },
    ));

    setChildren(children);
  }

  return <form { ...{ className: props.className } }>
    <div className='row'>
      { children }
      <div>{ l > 0 ? 'loading' : '' }</div>
    </div>
  </form>;
};
