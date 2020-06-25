import React from "react";
import { useLoader } from '../effect';

export default (props) => {
  let currentValue;

  if (props.source) {
    const [value, setValue] = React.useState(props.value || '');

    useLoader(() => props.source().then((value) => {
      if (props.onChange) {
        props.onChange(value);
      }

      return value;
    }).then(setValue), props.onLoading, props.onLoaded, props.onError);

    currentValue = value;
  } else {
    currentValue = props.value;
  }

  return <input
    value={ currentValue }
    type={ props.type || 'input' }
    onBlur={ props.onChange && ((e) => props.onChange(e.currentTarget.value)) }
  />;
};
