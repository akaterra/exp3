import React from "react";
import { Form, Stream, Submit } from '../../atom';
import { Input, Password, Select } from '../../molecule';
import { Session } from '.';

export default (props) => {
  const api = props.api;

  return <div className='container'>
    <div>{ props.connection.name }</div>
    <div className='f1'>Menu</div>
    <div className='f5'>Content</div>
    <Form>
      <Stream source={ () => api.selectDbs() } field='db'><Select.WithLabel label='db' mapper={ _ => _.name } /></Stream>
    </Form>
  </div>;
};
