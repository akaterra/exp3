import { Arr } from 'invary';
import React from 'react';
import { default as Auth } from '../auth';
import { default as Connection } from '../connection';
import { Source } from '../../atom';

function Tabs(props) {
  let [currentTabIndex, setCurrentTabIndex] = React.useState(0);
  let [tabs, setTabs] = React.useState(_ => Arr([]));

  React.useEffect(() => {
    if (props.tabs) {
      tabs = props.tabs.map((tab,) => {
        const cachedTabComponent = tabs.find((t) => t.props.id === tab.id);

        if (!cachedTabComponent) {
          switch (tab.type) {
            case 'auth':
              return <Auth.Component key={ tab.id } { ...tab }/>;
            case 'connection':
              return <Connection.Component key={ tab.id } { ...tab }/>;
          }
        }

        return cachedTabComponent;
      });

      setTabs(tabs);
    }
  }, [props.tabs]);

  return <div className='row'>
    <div className='c18'>
      <div className='tabs underlined'>
        <div className='tabs-bar'>
          {
            tabs.map((tab, ind) => <div
              className={ ind === currentTabIndex ? 'tab active' : 'tab' }
              key={ ind }
              onClick={ () => setCurrentTabIndex(ind) }>
              { tab.props.name }
            </div>)
          }
        </div>
        <div className='tabs-content underlined'></div>
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
  </div>;
};

export default (props) => {
  const { flow } = props;

  return <Source source={ flow.tabs } prop='tabs' component={ Tabs }/>;
};
