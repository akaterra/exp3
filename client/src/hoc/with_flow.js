import React from "react"
import { connectionManager } from '../api'

export default (Component, StateMachine) => {
  return (props) => {
    let [sm, setSm] = React.useState(null);

    if (!sm) {
      sm = new StateMachine(connectionManager.get(props.connection.session.name));

      setSm(sm);

      sm.run();
    }

    return <Component
      api={ sm }
      { ...props }
    />;
  };
};
