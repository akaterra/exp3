import React from "react";

export default (props) => {
  return <label className={ props.className ? `${props.className} label primary` : 'label primary' }>
    { props.children }
  </label>;
};
