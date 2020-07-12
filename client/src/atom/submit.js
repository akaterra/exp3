import React from "react";

export default (props) => {
  return <div className='c18'>
    <button className='button' role='submit' onClick={ (e) => {
      e.preventDefault();

      if (props.onSubmit) {
        props.onSubmit();
      }
    } }>
      { props.children.length ? props.children : 'Submit' }
    </button>
  </div>;
};
