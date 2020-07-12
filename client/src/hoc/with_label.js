import React from "react";
import { Label } from '../atom';

export default (Component) => {
  return (props) => {
    const { className, label, ...restProps } = props;

    if (label) {
      return <div className={ className || 'c18' }>
        <Label>{ label }<Component { ...restProps } /></Label>
      </div>
    };

    return <Component className={ className } { ...restProps } />;
  };
};
