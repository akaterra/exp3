import React from "react";

export default (props) => {
  const [value, setValue] = React.useState(props.value);

  React.useEffect(() => {
    setValue(props.value);

    if (props.onChange) {
      props.onChange(props.value);
    }
  }, [props.value]);

  return <input
    className={ props.className ? `${props.className} control` : 'control' }
    value={ value }
    type={ props.type || 'input' }
    onBlur={ props.onChange && ((e) => {
      if (!value && props.nullable) {
        props.onChange(undefined);
      } else {
        props.onChange(value);
      }
    }) }
    onChange={ (e) => {
      setValue(e.currentTarget.value);
    } }
  />;
};
