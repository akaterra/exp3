import React from "react";

export default (props) => {
  return <button role='submit' onClick={ (e) => {
    e.preventDefault();

    if (props.onSubmit) {
      props.onSubmit();
    }
  } }>
    { props.children.length ? props.children : 'Submit' }
  </button>;
};
