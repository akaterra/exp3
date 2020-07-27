import { set, Arr } from 'invary';
import React, { Children } from "react";

export default (props) => {
  if (!props.items) {
    return null;
  }

  return <div className={ props.className } style={ props.style }>
    {
      props.items.map(([name, action], i) => {
        if (name === '__ROOT__') {
          return null;
        }

        return <a
          key={ i }
          className={ props.value === name ? 'link primary text-shadow' : 'link default' }
          style={ { display: 'block' } }
          onClick={ _ => {
            if (props.onSubmit) {
              props.onSubmit(action);
            }
          } }
        >
          { name }
        </a>;
      })
    }
  </div>;
};
