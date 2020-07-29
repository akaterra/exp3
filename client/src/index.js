import '@babel/polyfill';
import { applyIsArrayPatch } from 'invary';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './mini.css';
import './json-inspector.css';
import './index.css';
import './index.sass';
import { connectionManager } from './api';
import { debug } from './debug';
import { Source } from './atom';
import { default as MainFlow } from './entity/main';

applyIsArrayPatch();

const style = {
  overlap: {
    backgroundColor: '#ff000010',
    position: 'fixed',
    right: 0,
    top: 0,
    width: '300px',
    zIndex: 2000,
  },
}

function Debug(props) {
  return <pre style={ style.overlap }>{ JSON.stringify(props.json, undefined, 2) }</pre>;
}

const mainFlow = new MainFlow(connectionManager);
mainFlow.run();

ReactDOM.render(
  <React.Fragment> 
    <MainFlow.Component flow={ mainFlow }/>
    <Source source={ debug } prop='json'>
      <Debug/>
    </Source>
  </React.Fragment>,
  document.getElementById('container'),
)
