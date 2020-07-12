import { set, Arr } from 'invary';
import React, { Children } from "react";

export default (props) => {
  if (!props.items) {
    return null;
  }

  return <div className='c18'>
    {
      props.items.map(([name, action], i) => {
        if (name === '__ROOT__') {
          return null;
        }

        return <a
          key={ i }
          style={ { display: 'block' } }
          onClick={ props.onSubmit && (() => props.onSubmit(action)) }
        >
          { name }
        </a>;
      })
    }
  </div>;
};
