import { Arr } from 'invary';
import React from 'react';
import { default as Auth } from '../auth';
import { default as Connection } from '../connection';
import { Source } from '../../atom';

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

  return <div className='row'>
    <div className='c20'>
      <div className='tabs underlined'>
        <div className='tabs-bar'>
          {
            tabs.map((tab, i) => <div
              className={ i === currentTabIndex ? `tab ${ props.tabs[i].type === 'auth' ? 'primary' : ''} active` : `tab ${ props.tabs[i].type === 'auth' ? 'primary' : ''}` }
              key={ i }
              onClick={ () => setCurrentTabIndex(i) }>
              { tab.props.name }
            </div>)
          }
        </div>
        <div className='tabs-content underlined'></div>
        <div className='c20'>
          { 
            tabs.map((tab, ind) => <div
              className={ ind === currentTabIndex ? '' : 'hidden' }
              key={ ind }
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

  return <Source source={ flow.tabs } prop='tabs' component={ Tabs }/>;
};
