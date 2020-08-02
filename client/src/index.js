import '@babel/polyfill';
import { applyIsArrayPatch } from 'invary';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './mini.css';
import './json-inspector.css';
import './index.css';
import './index.sass';
import { connectionManager } from './api';
import { Source, ValueViewer } from './atom';
import { debug } from './debug';
import { default as MainFlow } from './entity/main';

applyIsArrayPatch();

const style = {
  overlap: {
    backgroundColor: '#0000ffc0',
    color: 'white',
    fontSize: '0.25rem',
    position: 'fixed',
    right: 0,
    top: 0,
    width: '500px',
    zIndex: 2000,
  },
}

function Debug(props) {
  let [isShown, setIsShown] = React.useState(false);

  React.useEffect(() => {
    document.onkeydown = (e) => {
      if (e.key === 'd' && e.ctrlKey) {
        isShown = !isShown;

        setIsShown(isShown);
      }
    }
  }, [true]);

  if (!isShown) {
    return null;
  }

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
