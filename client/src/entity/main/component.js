import { Arr } from 'invary';
import React from 'react';
import { readError } from '../action';
import { default as Auth } from '../auth';
import { default as Connection } from '../connection';
import { Source } from '../../atom';

const style = {
  container: {
    paddingTop: '25px',
  },
  errors: {
    bottom: '1rem',
    position: 'fixed',
    right: '1rem',
    width: '300px',
    zIndex: 1000,
  }
};

function Errors(props) {
  if (!props.errors || !props.errors.length) {
    return null;
  }

  return <div className='row' style={ style.errors }>{
    props.errors.map((error, i) => <div className='c20' key={ i }><div className='alert failure'>{ `${error[0].status}: ${JSON.stringify(error[0].error)}` }</div></div>)
  }</div>;
}

function Tabs(props) {
  if (!props.tabs) {
    return null;
  }

  let [currentTabIndex, setCurrentTabIndex] = React.useState(0);
  let [tabs, setTabs] = React.useState(_ => Arr([]));

  React.useEffect(() => {
    tabs = props.tabs.map((tab,) => {
      const childTabComponent = tabs.find((t) => t.props.id === tab.id);

      if (!childTabComponent) {
        switch (tab.type) {
          case 'auth':
            return <Auth.Component key={ tab.id } { ...tab }/>;
          case 'connection':
            return <Connection.Component key={ tab.id } { ...tab }/>;
        }
      }

      return childTabComponent;
    });

    setTabs(tabs);
  }, [props.tabs]);

  return <div className='row' style={ style.container }>
    <div className='c20'>
      <div className='tabs'>
        <div className='tabs-bar'>
          {
            tabs.map((tab, i) => <button
              key={ i }
              className={ i === currentTabIndex ? `tab ${ props.tabs[i].type === 'auth' ? 'primary' : ''} active` : `tab ${ props.tabs[i].type === 'auth' ? 'primary' : ''}` }
              onClick={ () => setCurrentTabIndex(i) }
            >
              { tab.props.name }
            </button>)
          }
        </div>
        <div className='tabs-content underlined'></div>
        <div className='c20'>
          { 
            tabs.map((tab, i) => <div
              key={ i }
              className={ i === currentTabIndex ? '' : 'hidden' }
            >
              { tab }
            </div>)
          }
        </div>
      </div>
    </div>
  </div>;
};

export default (props) => {
  const { flow } = props;

  let [errors, setErrors] = React.useState(Arr([]));

  React.useEffect(_ => {
    readError(flow).subscribe(({ action, data }) => {
      console.error(data);
      errors.push([data, Date.now() + 10 * 1000])[0];

      setErrors(errors);
    });

    setInterval(_ => {
      const now = Date.now();
      errors = errors.filter((error) => error[1] >= now);

      setErrors(errors);
    }, 500);
  }, [true]);

  return [
    <Source source={ flow.tabs } prop='tabs' component={ Tabs }/>,
    <Errors errors={ errors }/>,
  ];
};
