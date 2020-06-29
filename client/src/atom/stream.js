import { set } from 'invary';
import React, { Children } from "react";

export default (props) => {
  let [children, setChildren] = React.useState(null);
  let [streams, setStreams] = React.useState(null);

  if (!streams) {
    let { source, sources, to, selector, ...restProps } = props;

    if (!sources && source && to) {
      sources = [[source, to, selector]];
    }

    if (sources) {
      if (!props.children) {
        throw new Error('At least one child must be provided');
      }

      children = props.children;

      if (!Array.isArray(children)) {
        children = [React.cloneElement(children, { key: 0, ...restProps, ...children.props })];
      }

      const initialChildren = children;
      const initialChildrenProps = children.map((child, index) => ({ key: index, ...restProps, ...child.props }));

      function applyPropToChildren(prop, data) {
        children = initialChildren.map((child, index) => {
          const props = initialChildrenProps[index] = set(initialChildrenProps[index], prop, data);

          return React.cloneElement(child, props);
        });

        setChildren(children);
      }

      const streams = [];

      for (const [source, prop, selector] of sources) {
        const stream = typeof source === 'function' ? source() : source;

        stream.subscribe(({ event, data }) => {
          if (selector) {
            data = selector(data);
          }

          applyPropToChildren(prop, data);
        });

        streams.push(stream);
      }

      setStreams(streams);
    }
  }

  return <React.Fragment>{ children || props.children }</React.Fragment>;
};
