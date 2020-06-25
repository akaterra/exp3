import { Arr } from 'invary';
import React from 'react';
import { Auth } from './connection';
import { withApi } from '../hoc';

const AuthWithApi = withApi(Auth);

export default (props) => {
  const [items, setItems] = React.useState(() => {
    function add(Component, props) {
      setItems(items.unshift(<Component key={ items.length } onAdd={ add } { ...props }/>)[0]);
    }

    return Arr([<AuthWithApi key={ 0 } onAdd={ add }></AuthWithApi>]);
  });

  return <div className='container'>{ items }</div>;
};
