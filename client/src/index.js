import '@babel/polyfill';
import { applyIsArrayPatch } from 'invary';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Layout } from './organism';
import './mini.min.css';
import { connectionManager } from './api';
import { default as MainFlow } from './entity/main';

applyIsArrayPatch();

const mainFlow = new MainFlow(connectionManager);
mainFlow.run();

ReactDOM.render(
  <MainFlow.Component flow={ mainFlow }></MainFlow.Component>,
  document.getElementById('container'),
)
