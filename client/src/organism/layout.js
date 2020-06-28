import { Arr } from 'invary';
import React from 'react';
import { Auth, default as Connection } from './connection';
import { withApi, withStateMachine } from '../hoc';
import { ConnectionStateMachine } from '../state_machine';

Auth.WithApi = withApi(Auth);
Connection.WithStateMachine = withStateMachine(Connection, ConnectionStateMachine);

export default (props) => {
  let [items, setItems] = React.useState(() => {
    function auth(connection) {
      items = items.unshift(<Connection.WithStateMachine
        key={ items.length }
        connection={ connection }
      />)[0];
  
      setItems(items);
    }

    return Arr([<Auth.WithApi key={ 0 } onAuth={ auth } />]);
  });

  return <div className='container'>{ items }</div>;
};
