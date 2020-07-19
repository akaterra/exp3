import React, { Component } from "react";

const style = {
  array: {
    display: 'block',
    fontFamily: 'monospace',
    whiteSpace: 'nowrap',
  },
  boolean: {
    display: 'block',
    fontFamily: 'monospace',
  },
  Date: {
    display: 'block',
    fontFamily: 'monospace',
  },
  key: {
    paddingRight: '0.25rem',
    fontFamily: 'monospace',
  },
  null: {
    display: 'block',
    fontFamily: 'monospace',
  },
  number: {
    display: 'block',
    fontFamily: 'monospace',
  },
  object: {
    display: 'block',
    fontFamily: 'monospace',
    whiteSpace: 'nowrap',
  },
  string: {
    display: 'block',
    fontFamily: 'monospace',
  },
  sub: {
    borderLeft: '2px solid #bfbfbf',
    fontFamily: 'monospace',
    marginBottom: '0.5rem',
    marginTop: '0.5rem',
    paddingLeft: 'calc(1rem - 2px)',
    
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
      children = <span style={ style.boolean }>{ keyName }{ value }</span>;
    } else if (value instanceof Date) {
      children = <span style={ style.boolean }>{ keyName }{ value.replace(/-/g, '&#8209;') }</span>;
    } else {
      switch (typeof value) {
        case 'boolean':
          children = <span style={ style.boolean }>{ keyName }{ value }</span>

          break;
        case 'number':
          children = <span style={ style.number }>{ keyName }{ value }</span>

          break;
        case 'object':
          if (Array.isArray(value)) {
            children = <a
              style={ style.array }
              onClick={ _ => setChildren(<ValueViewerArrComponent keyName={ keyName } value={ value }/>)}
            >
              { keyName }{ `[ ${value.length} ]` }
            </a>
          } else {
            children = <a
              style={ style.object }
              onClick={ _ => setChildren(<ValueViewerObjComponent keyName={ keyName } value={ value }/>)}
            >
              { keyName }{ `{ ${Object.keys(value).length} }` }
            </a>
          }

          break;
        case 'string':
          children = <span style={ style.string }>{ keyName }{ value }</span>

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
    style={ style.object }
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
    style={ style.object }
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
