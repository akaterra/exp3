import React from "react"
import { connectionManager } from '../api'

export default (Component) => {
  return (props) => {
    return <Component api={ connectionManager } { ...props }/>;
  };
};
