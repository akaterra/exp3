import React from "react";
import { Form, Submit } from '../../atom';
import { useLoader } from '../../effect';
import { Input, Password, Select } from '../../molecule';
import { Session } from '.';

export default (props) => {
  return <div className='container'>
    <Form
      onChange={ (v) => console.log(v) }
      onSubmit={ (p) => props.api.connect(p) }
    >
      <Select.WithLabel label='Driver:' source={ props.api && (() => props.api.selectDrivers()) } />
      <Input.WithLabel label='Username:' field='username' />
      <Password.WithLabel label='Password:' field='password' />
      <Submit>Connect</Submit>
    </Form>
  </div>;
};
