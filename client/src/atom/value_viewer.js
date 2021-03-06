import React, { Component } from "react";

const style = {
  boolean: {
    display: 'block',
  },
  Date: {
    display: 'block',
  },
  key: {
    paddingRight: '0.25rem',
  },
  null: {
    display: 'block',
  },
  number: {
    display: 'block',
  },
  string: {
    display: 'block',
  },

  arrObj: {
    color: '#a38529',
    display: 'block',
    whiteSpace: 'nowrap',
  },
  sub: {
    borderLeft: '2px solid #bfbfbf',
    margin: '0.5rem 0 0.5rem calc(0.25rem - 1px)',
    paddingLeft: 'calc(0.75rem - 1px)',
  },
}

const ValueViewerComponent = (props) => {
  let { keyName, refresh, value } = props;

  if (value === undefined) {
    return null;
  }

  React.useEffect(_ => setChildren(undefined), [value]);

  let [children, setChildren] = React.useState();

  if (children === undefined) {
    if (keyName !== undefined) {
      keyName = <span style={ style.key }>{ keyName }:</span>
    } else {
      keyName = null;
    }

    if (value === null) {
      children = <span className='success-dark-20' style={ style.null }>{ keyName }{ 'Null' }</span>;
    } else {
      switch (typeof value) {
        case 'boolean':
          children = <span className='failure-dark-20' style={ style.boolean }>{ keyName }{ value ? 'True' : 'False' }</span>

          break;
        case 'number':
          children = <span className='primary-dark-20' style={ style.number }>{ keyName }{ value }</span>

          break;
        case 'object':
          if (Array.isArray(value)) {
            const len = value.length;

            children = <a
              className='warning-dark-20'
              style={ style.arrObj }
              onClick={ len && (_ => setChildren(<ValueViewerArrComponent keyName={ keyName } value={ value }/>))}
            >
              { keyName }{ `[ ${len} ]` }
            </a>
          } else {
            const len = Object.keys(value).length;

            children = <a
              className='warning-dark-20'
              style={ style.arrObj }
              onClick={ len && (_ => setChildren(<ValueViewerObjComponent keyName={ keyName } value={ value }/>))}
            >
              { keyName }{ `{ ${len} }` }
            </a>
          }

          break;
        case 'string':
          children = <span className='default-dark-20' style={ style.string }>{ keyName }{ value }</span>

          break;
      }
    }

    setChildren(children);
  }

  return children;
};

const ValueViewerArrComponent = (props) => {
  let { keyName, value } = props;

  if (value === undefined) {
    return null;
  }
  
  let [isExpended, setIsExpended] = React.useState(true);

  return [
    <a
    style={ style.arrObj }
    onClick={ _ => {
      setIsExpended(!isExpended);
    } }
    >
      { keyName }{ `[ ${value.length} ]` }
    </a>,
    <div className={ isExpended ? '' : 'hidden' } style={ style.sub }>
      { value.map((val, ind) => <ValueViewerComponent key={ ind } keyName={ ind } value={ val }/>) }
    </div>
  ];
}

const ValueViewerObjComponent = (props) => {
  let { keyName, value } = props;

  if (value === undefined) {
    return null;
  }

  let [isExpended, setIsExpended] = React.useState(true);

  return [
    <a
    style={ style.arrObj }
    onClick={ _ => {
      setIsExpended(!isExpended);
    } }
    >
      { keyName }{ `{ ${Object.keys(value).length} }` }
    </a>,
    <div className={ isExpended ? '' : 'hidden' } style={ style.sub }>
      { Object.entries(value).map(([key, val]) => <ValueViewerComponent key={ key } keyName={ key } value={ val }/>) }
    </div>
  ];
}

export default ValueViewerComponent;
