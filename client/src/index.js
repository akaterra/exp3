import '@babel/polyfill';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Layout } from './organism';
import './mini.min.css';

ReactDOM.render(
  <Layout name='test'></Layout>,
  document.getElementById('container'),
)
