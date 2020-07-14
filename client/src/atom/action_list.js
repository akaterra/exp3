import { set, Arr } from 'invary';
import React, { Children } from "react";

export default (props) => {
  if (!props.items) {
    return null;
  }

  return <div className='ccc' style={ props.style }>
    {
      props.items.map(([name, action], i) => {
        if (name === '__ROOT__') {
          return null;
        }

        return <a
          key={ i }
          className='link default'
          style={ { display: 'block' } }
          onClick={ props.onSubmit && (() => props.onSubmit(action)) }
        >
          { name }
        </a>;
      })
    }
  </div>;
};
