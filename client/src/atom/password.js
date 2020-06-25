import React from "react";

export default (props) => {
  return <input
    type='password'
    onBlur={ props.onChange && ((e) => props.onChange(e.currentTarget.value)) }
  />;
};
