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
    value={ value }
    type={ 'password' }
    onBlur={ props.onChange && ((e) => {
      if (!value && props.nullable) {
        return;
      }

      props.onChange(value);
    }) }
    onChange={ (e) => {
      setValue(e.currentTarget.value);
    } }
  />;
};