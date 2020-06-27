import React from "react";

export default (props) => {
  let [children, setChildren] = React.useState(null);
  let [stream, setStream] = React.useState(null);

  if (!stream) {
    const { source, to, ...restProps } = props;

    if (source) {
      if (typeof source === 'function') {
        stream = source();
      } else {
        stream = source;
      }

      if (stream instanceof Promise) {
        setStream(true);

        stream.then((data) => {
          children = React.cloneElement(props.children, {
            [to || 'data']: props.mapper ? props.mapper(data) : data,
            ...restProps,
          });

          setChildren(children);
        })
      } else {
        setStream(stream);

        stream.subscribe(({ event, data }) => {
          children = React.cloneElement(props.children, {
            [to || 'data']: props.mapper ? props.mapper(data) : data,
            ...restProps,
          });

          setChildren(children);
        });
      }
    }
  }

  return <React.Fragment>{ children || props.children }</React.Fragment>;
};
