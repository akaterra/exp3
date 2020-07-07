import React from 'react';
import { Form, Source, Submit } from '../../atom';
import { Input, Password, Select } from '../../molecule';

export default (props) => {
  const { flow } = props;

  return <div className='row'>
    <div className='c-7 show-med show-lrg'></div>
    <Form
      className='c-4 -m-'
      state={ {
        driver: 'mongodb',
      } }
      onSubmit={ api && ((params) => {
        flow.sendConnectAction(params);
      }) }
    >
      <Source source={ flow.currentDriversNames } prop='items' field='driver'><Select.WithLabel label='Driver:' /></Source>
      <Input.WithLabel label='Host:' field='host' nullable />
      <Input.WithLabel label='Username:' field='username' nullable />
      <Password.WithLabel label='Password:' field='password' nullable />
      <Submit>Connect</Submit>
    </Form>
  </div>;
};
