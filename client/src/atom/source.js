import { all, set, Arr } from 'invary';
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
    let { source, prop, selector, props: mapToProps, ...restProps } = props;

    if (!mapToProps && source && prop) {
      mapToProps = [[source, prop, selector]];
    }

    if (mapToProps) {
      if (!props.children && !props.component) {
        console.warn('At least one child or component must be provided');

        return null;
      }

      if (!Array.isArray(mapToProps) && typeof mapToProps === 'object') {
        mapToProps = Object.entries(mapToProps).map(([prop, source]) => [
          Array.isArray(source) ? source[0] : source,
          prop,
          Array.isArray(source) ? source[1] : undefined,
        ]);
      }

      children = props.children || <props.component></props.component>;

      if (!Array.isArray(children)) {
        children = [children];
      }

      const initialChildren = children;
      const initialChildrenProps = children.map((child, index) => ({ key: index, ...restProps, ...child.props }));

      function applyPropToChildren(prop, data) {
        children = initialChildren.map((child, index) => {
          let props;

          if (prop === '...') {
            props = initialChildrenProps[index] = all(initialChildrenProps[index], ...Object.entries(data).flat());
          } else {
            props = initialChildrenProps[index] = set(initialChildrenProps[index], prop, data);
          }

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

      for (const [source, prop, selector] of mapToProps) {
        source = typeof source === 'function' ? source() : source;

        if (!(source instanceof Subject)) {
          source = from(source instanceof Promise ? source : [source]);
        }

        const subscription = source.subscribe(({ action, data, extra }) => {
          console.log({ action, data, prop });

          if (selector) {
            data = selector(data !== undefined ? data : action);
          }

          if (extra && typeof extra === 'object') {
            extra[prop] = data !== undefined ? data : action;

            applyPropToChildren('...', extra);
          } else {
            applyPropToChildren(prop, data !== undefined ? data : action);
          }
        });

        subscriptions.push(subscription);
      }

      setSubscriptions(subscriptions);
    }
  }

  return <React.Fragment>{ children || props.children }</React.Fragment>;
};
