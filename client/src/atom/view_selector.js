import { set } from 'invary';
import React, { Children } from "react";

const style = {
  item: {
    paddingRight: '1rem',
  },
};

export default (props) => {
  if (!props.children) {
    return null;
  }

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
        return <div key={ index }>{ child }</div>;
      } else {
        return <div key={ index } className='hidden'>{ child }</div>;
      }
    });

    if (props.switchers) {
      children.unshift(<div className='c20'>
        {
          Object.entries(props.switchers).map(([key, val], i) => <a
            key={ i }
            className={ key === props.view ? 'link primary text-shadow' : 'link default' }
            style={ style.item }
            onClick={ _ => {
              if (props.onChange) {
                props.onChange(key);
              }
            } }
          >
            { val }
          </a>)
        }
      </div>);
    }

    setChildren(<div className={ props.className }>{ children }</div>);
    setView(view);
  }

  return children;
};
