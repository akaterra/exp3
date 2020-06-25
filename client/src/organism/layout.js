import { Arr } from 'invary';
import React from 'react';
import { Auth } from './connection';
import { withApi } from '../hoc';

export default (props) => {
  const [items, setItems] = React.useState(() => {
    function add(Component, props) {
      setItems(items.unshift(<Component key={ items.length } onAdd={ add } { ...props }/>)[0]);
    }

    const AuthWithApi = withApi(Auth);

    return Arr([<AuthWithApi key={ 0 } onAdd={ add }></AuthWithApi>]);
  });

  return <div className='container'>{ items }</div>;
};
