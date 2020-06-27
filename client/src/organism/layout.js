import { Arr } from 'invary';
import React from 'react';
import { Auth, Session } from './connection';
import { withApi } from '../hoc';

Auth.WithApi = withApi(Auth);

export default (props) => {
  let [items, setItems] = React.useState(() => {
    function add(Component, props) {
      items = items.unshift(<Component key={ items.length } onAdd={ add } { ...props } />)[0];
  
      setItems(items);
    }

    return Arr([<Auth.WithApi key={ 0 } onAdd={ add } component={ Session } />]);
  });

  return <div className='container'>{ items }</div>;
};
