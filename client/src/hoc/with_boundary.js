import React from "react";
import { Label } from '../atom';

export default (Component) => {
  return (props) => {
    const { className, ...restProps } = props;

    if (className) {
      return <div className={ className }><Component { ...restProps }/></div>;
    };

    return <Component { ...restProps }/>;
  };
};
