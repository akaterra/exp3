import React from "react";

export default (props) => {
  const [value, setValue] = React.useState(props.value);

  React.useEffect(() => {
    setValue(props.value);

    // if (props.onChange) {
    //   props.onChange(props.value);
    // }
  }, [props.value]);

  let items = props.items;

  if (items) {
    const mapper = props.mapper;

    if (Array.isArray(items)) {
      items = items
        .map((item, i) => <option key={ i } value={ item }>{ mapper ? mapper(item) : item === '__ROOT__' ? 'All' : item }</option>);
    } else if (typeof items === 'object') {
      items = Object.entries(items)
        .map(([key, item]) => <option key={ key } value={ key }>{ mapper ? mapper(item) : item === '__ROOT__' ? 'All' : item }</option>);
    }
  }

  return <select
    className='control'
    disabled={ items ? items.length < 2 : false }
    value={ value }
    onChange={ (e) => {
      const value = e.currentTarget.options[e.currentTarget.selectedIndex].value;

      setValue(value);

      if (props.onChange) {
        props.onChange(value);
      }
    } }
  >
    { items }
  </select>;
};
