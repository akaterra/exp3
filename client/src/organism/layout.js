import { Arr } from 'invary';
import React from 'react';
import { Auth, default as Connection } from './connection';
import { withApi, withFlow } from '../hoc';
import { ConnectionStateMachine } from '../state_machine';

Auth.WithApi = withApi(Auth);
Connection.WithStateMachine = withFlow(Connection, ConnectionStateMachine);

export default (props) => {
  let [index, setIndex] = React.useState(0);
  let [items, setItems] = React.useState(() => {
    function auth(connection) {
      items = items.unshift(<Connection.WithStateMachine
        key={ items.length }
        connection={ connection }
        name={ connection.session.name }
      />)[0];
  
      setIndex(0);
      setItems(items);
    }

    return Arr([<Auth.WithApi name='Connect' key={ 0 } onAuth={ auth } />]);
  });

  return <div className='row'>
    <div className='c18'>
      <div className='tabs underlined'>
        <div className='tabs-bar'>
          { items.map((item, itemIndex) => <div
            className={ index === itemIndex ? 'tab active' : 'tab' }
            key={ itemIndex }
            onClick={ () => setIndex(itemIndex) }>
              { item.props.name }
            </div>)
          }
        </div>
        <div class='tabs-content underlined'></div>
        { items[index] }
      </div>
    </div>
  </div>;
};
