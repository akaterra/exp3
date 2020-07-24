import '@babel/polyfill';
import { applyIsArrayPatch } from 'invary';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './mini.css';
import './json-inspector.css';
import './index.css';
import './index.sass';
import { connectionManager } from './api';
import { default as MainFlow } from './entity/main';

applyIsArrayPatch();

const mainFlow = new MainFlow(connectionManager);
mainFlow.run();

ReactDOM.render(
  <MainFlow.Component flow={ mainFlow }></MainFlow.Component>,
  document.getElementById('container'),
)
