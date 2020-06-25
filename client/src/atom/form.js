import { set } from 'invary';
import React from "react";

export default (props) => {
  const [params, setParams] = React.useState({});

  const children = props.children.map((child, i) => React.cloneElement(
    child,
    {
      key: i,
      onChange: child.props.field && ((value) => {
        const newParams = set(params, child.props.field, value);

        if (newParams !== params) {
          setParams(newParams);

          if (props.onChange) {
            props.onChange(newParams);
          }
        }
      }),
    },
  ));

  return <form>{ children }</form>;
};
