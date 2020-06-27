import React from "react";
import { useLoader } from '../effect';

export default (props) => {
  return <input
    value={ props.value }
    type='password'
    onBlur={ props.onChange && ((e) => {
      const value = e.currentTarget.value;

      if (!value && props.nullable) {
        return;
      }

      props.onChange(value);
    }) }
  />;
};
