import React from "react";
import { Form, Submit } from '../../atom';
import { useLoader } from '../../effect';
import { Input, Password, Select } from '../../molecule';
import { Session } from '.';

export default (props) => {
  const api = props.api;

  return <div className='container'>
    <Form
      onChange={ (v) => console.log(v) }
      onSubmit={ (p) => props.api.connect(p).then(() => props.onAdd(Session) ) }
    >
      <Select.WithLabel label='Driver:' field='driver' source={ api && (() => api.selectDrivers()) } />
      <Input.WithLabel label='Username:' field='username' />
      <Password.WithLabel label='Password:' field='password' />
      <Submit>Connect</Submit>
    </Form>
  </div>;
};
