import '@babel/polyfill';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Connection } from './page';

ReactDOM.render(
  <Connection name='test'></Connection>,
  document.getElementById('container')
)
