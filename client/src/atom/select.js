import React from "react";

export default (props) => {
  let [isShown, setIsShown] = React.useState(false);
  let [value, setValue] = React.useState(props.value);

  React.useEffect(() => {
    setValue(props.value);

    // if (props.onChange) {
    //   props.onChange(props.value);
    // }
  }, [props.value]);

  let items = props.items;
  let shownValue = value;

  if (items) {
    const mapper = props.mapper;

    if (Array.isArray(items)) {
      items = items
        .map((item, i) => {
          let shownItemValue = item;

          if (mapper) {
            shownItemValue = mapper(shownItemValue);
          }

          if (shownItemValue === '__ROOT__') {
            shownItemValue = 'All';
          }

          if (item === value) {
            shownValue = shownItemValue;
          }

          return <a
            key={ i }
            className={ item === value ? 'link primary' : 'link default' }
            style={ { display: 'block' } }
            onClick={ () => {
              if (props.onChange) {
                props.onChange(item);
              }

              setIsShown(false);
              setValue(item);
            } }
          >
            { shownItemValue }
          </a>
        });
    } else if (typeof items === 'object') {
      items = Object.entries(items)
        .map(([key, item]) => {
          let shownItemValue = item;

          if (mapper) {
            shownItemValue = mapper(shownItemValue);
          }

          if (shownItemValue === '__ROOT__') {
            shownItemValue = 'All';
          }

          if (key === value) {
            shownValue = shownItemValue;
          }

          return <a
            key={ key }
            className={ key === value ? 'link primary' : 'link default' }
            style={ { display: 'block' } }
            onClick={ () => {
              if (props.onChange) {
                props.onChange(key);
              }

              setIsShown(false);
              setValue(key);
            } }
          >
            { shownItemValue }
          </a>
        });
    }
  }

  if (items && items.length < 2) {
    return <input
      className='control no-margin'
      value={ shownValue }
      style={ { cursor: 'pointer' } }
      readonly
    />
  }

  return <div className='cow'>
    <input
      className='control no-margin'
      style={ { cursor: 'pointer' } }
      readonly
      value={ shownValue }
      onFocus={ () => setIsShown(true) }
      onClick={ () => setIsShown(true) }
    />
    <div
      style={ {
        display: isShown ? '' : 'none',
        position: 'absolute',
        top: 0,
        width: '100%',
        zIndex: 1000,
      } }
    >
      <div
        onBlur={ () => setIsShown(false) }
        onMouseOver={ () => setIsShown(true) }
        onMouseOut={ () => setIsShown(false) }
      >
        <input
          className='control'
          style={ { cursor: 'pointer' } }
          readonly
          value={ shownValue }
          onClick={ () => setIsShown(false) }
        />
        <div style={ { maxHeight: '200px', overflowX: 'hidden', overflowY: 'auto' } } className='panel shadow'>
          { items }
        </div>
      </div>
    </div>
  </div>

  // return <select
  //   className='control'
  //   disabled={ items ? items.length < 2 : false }
  //   value={ value }
  //   onChange={ (e) => {
  //     const value = e.currentTarget.options[e.currentTarget.selectedIndex].value;

  //     setValue(value);

  //     if (props.onChange) {
  //       props.onChange(value);
  //     }
  //   } }
  // >
  //   { items }
  // </select>;
};
