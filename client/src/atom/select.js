import React from "react";

const style = {
  dropdown: {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 1000,
  },
  dropdownInput: {
    opacity: 0,
    cursor: 'pointer',
  },
  input: {
    caretColor: 'transparent',
    cursor: 'pointer',
  },
  list: {
    maxHeight: '200px',
    overflowX: 'hidden',
    overflowY: 'auto',
    width: '100%',
  },
}

export default (props) => {
  let [isShown, setIsShown] = React.useState(false);
  let [value, setValue] = React.useState(props.value);
  let [tempValue, setTempValue] = React.useState();

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
            value={ item }
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
            value={ key }
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
      style={ style.input }
      readonly
    />
  }

  return <div className='cow'>
    <input
      className='control'
      style={ style.input }
      value={ shownValue }
      onClick={ () => setIsShown(!isShown) }
      onKeyDown={ (e) => {
        const index = items.findIndex((item) => item.props.value === value);

        if (e.keyCode === 38) { // key up
          if (index > 0) {
            if (props.onChange) {
              props.onChange(value);
            }

            setValue(items[index - 1].props.value);
          }
        } else if (e.keyCode === 40) { // key down
          if (index < items.length - 1) {
            if (props.onChange) {
              props.onChange(value);
            }

            setValue(items[index + 1].props.value);
          }
        }
      } }
    />
    <div
      className={ isShown ? '' : 'hidden' }
      style={ style.dropdown }
      onMouseLeave={ () => setIsShown(false) }
    >
      <div className='control' style={ style.dropdownInput }></div>
      <div className='panel shadow' style={ style.list } onClick={ preventDefault }>
        { items }
      </div>
    </div>
  </div>
};

function preventDefault(e) {
  e.preventDefault();
}

function stopPropagation(e) {
  e.stopPropagation();
}
