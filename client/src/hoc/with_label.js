import React from "react";
import { Label } from '../atom';

export default (Component) => {
  return (props) => {
    const { label, ...restProps } = props;

    if (label) {
      return <div>
        { label ? <Label>{ label }</Label> : null }
        <Component { ...restProps } />
      </div>
    };

    return <Component { ...restProps } />;
  };
};
