import React from 'react';
import { Form, Source, Submit } from '../../atom';
import { Input, Password, Select } from '../../molecule';

const style = {
  width: '400px',
};

export default (props) => {
  const { flow } = props;

  return <div className='row flex flex-center'>
    <Form
      className='ccc'
      style={ style }
      state={ {
        driver: 'mongodb',
      } }
      onSubmit={ (params) => {
        flow.sendConnectAction(params);
      } }
    >
      <Source source={ flow.currentDriversNames } prop='items' field='driver'><Select.WithLabel label='Driver:' /></Source>
      <Input.WithLabel label='Host:' field='host' nullable />
      <Input.WithLabel className='c-9' label='Username:' field='username' nullable />
      <Password.WithLabel className='c-9' label='Password:' field='password' nullable />
      <Submit>Connect</Submit>
    </Form>
  </div>;
};
