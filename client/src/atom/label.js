import React from "react";

export default (props) => {
  return <label className={ props.className ? `${props.className} span default` : 'span default' }>
    { props.children }
  </label>;
};
