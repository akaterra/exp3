import { set } from 'invary';
import React from "react";

export default (props) => {
  const [params, setParams] = React.useState({});
  const [l, setL] = React.useState(0);

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

  return <form>{ children }<div>{ l > 0 ? 'loading' : '' }</div></form>;
};
