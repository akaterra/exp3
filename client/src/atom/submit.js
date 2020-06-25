import React from "react";

export default (props) => {
  return <button role='submit'>{ props.children.length ? props.children : 'Submit' }</button>;
};
