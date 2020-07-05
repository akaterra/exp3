import React from "react";
import { Form, Source, Submit } from '../../atom';
import { withApi } from '../../hoc';
import { Input, Password, Select } from '../../molecule';

export default (props) => {
  const api = props.api;

  return <div className='row'>
    <div className='c-7 show-med show-lrg'></div>
    <Form
      className='c-4 -m-'
      state={ {
        driver: 'mongodb',
      } }
      onChange={ (p) => console.log(p) }
      onSubmit={ api && ((params) => {
        api.connect(params).then(props.onAuth)
      }) }
    >
      <Source source={ api && (() => api.selectDrivers()) } prop='items' field='driver'><Select.WithLabel label='Driver:' /></Source>
      <Input.WithLabel label='Host:' field='host' nullable />
      <Input.WithLabel label='Username:' field='username' nullable />
      <Password.WithLabel label='Password:' field='password' nullable />
      <Submit>Connect</Submit>
    </Form>
  </div>;
};
