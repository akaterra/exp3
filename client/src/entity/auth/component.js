import React from 'react';
import { Form, Source } from '../../atom';
import { Input, Password, Select, Submit } from '../../molecule';

const style = {
  paddingTop: '50px',
  width: '300px',
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
      <div className='caption caption-lrg primary center'>DBEE</div>
      <Source source={ flow.currentDriversNames } prop='items' field='driver'><Select.WithLabel className='c20' label='Driver:' title='Auth tab, driver selectbox'/></Source>
      <Input.WithLabel className='c20' label='Host:' field='host' nullable title='Auth tab, host URI input'/>
      <Input.WithLabel className='c10' label='Username:' field='username' nullable title='Auth tab, username input'/>
      <Password.WithLabel className='c10' label='Password:' field='password' nullable title='Auth tab, username input'/>
      <Submit className='c20' title='Auth tab, submit'>Connect</Submit>
    </Form>
  </div>;
};
