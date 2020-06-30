import { set, Arr } from 'invary';
import React, { Children } from "react";
import { from, Subject } from 'rxjs';

export default (props) => {
  let [children, setChildren] = React.useState(null);
  let [subscriptions, setSubscriptions] = React.useState(null);

  React.useEffect(() => {
    if (subscriptions) {
      for (const subscription of subscriptions) {
        subscription.unsubscribe();
      }
    }

    setSubscriptions(null);
  }, []);

  if (!subscriptions) {
    let { source, to, selector, props: p, ...restProps } = props;

    if (!p && source && to) {
      p = [[source, to, selector]];
    }

    if (p) {
      if (!props.children) {
        throw new Error('At least one child must be provided');
      }

      if (!Array.isArray(p) && typeof p === 'object') {
        p = Object.entries(p).map(([prop, source]) => [
          Array.isArray(source) ? source[0] : source,
          prop,
          Array.isArray(source) ? source[1] : undefined,
        ]);
      }

      children = props.children;

      if (!Array.isArray(children)) {
        children = [children];
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

      if (subscriptions) {
        for (const subscription of subscriptions) {
          subscription.unsubscribe();
        }
      }

      subscriptions = [];

      for (const [source, prop, selector] of p) {
        source = typeof source === 'function' ? source() : source;

        if (!(source instanceof Subject)) {
          source = from(source instanceof Promise ? source : [source]);
        }

        const subscription = source.subscribe(({ action, data }) => {
          console.log({ action, data, prop });

          if (selector) {
            data = selector(data !== undefined ? data : action);
          }

          applyPropToChildren(prop, data !== undefined ? data : action);
        });

        subscriptions.push(subscription);
      }

      setSubscriptions(subscriptions);
    }
  }

  return <React.Fragment>{ children || props.children }</React.Fragment>;
};
