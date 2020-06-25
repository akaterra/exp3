import React from "react";

export default (props) => {
  return <input
    type={ props.type || 'input' }
    onBlur={ props.onChange && ((e) => props.onChange(e.currentTarget.value)) }
  />;
};
