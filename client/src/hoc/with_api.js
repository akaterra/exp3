import React from "react"
import { connectionManager } from '../api'

export default (Component, connectionName) => {
  return (props) => {
    return <Component
      api={ connectionName ? connectionManager.get(connectionName) : connectionManager }
      { ...props }
    />;
  };
};
