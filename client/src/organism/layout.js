import { Arr } from 'invary';
import React from 'react';
import { Auth } from './connection';
import { withApi } from '../hoc';

const AuthWithApi = withApi(Auth);

export default (props) => {
  let [items, setItems] = React.useState(() => {
    function add(Component, props) {
      items = items.unshift(<Component key={ items.length } onAdd={ add } { ...props } />)[0];
  
      setItems(items);
    }

    return Arr([<AuthWithApi key={ 0 } onAdd={ add }></AuthWithApi>]);
  });

  return <div className='container'>{ items }</div>;
};
