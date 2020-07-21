import React from "react";

export default (props) => {
  return <button className='button shadow' role='submit' title={ props.title } onClick={ (e) => {
    e.preventDefault();

    if (props.onSubmit) {
      props.onSubmit();
    }
  } }>
    { props.children.length ? props.children : 'Submit' }
  </button>;
};
