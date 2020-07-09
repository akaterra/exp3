import { Arr } from 'invary';
import React from 'react';
import { default as Auth } from '../auth';
import { Source } from '../../atom';

function Tabs(props) {

}

function TabsContent(props) {
  let [tabs, setTabs] = React.useState(_ => Arr([]));

  React.useEffect(() => {
    if (props.tabs) {
      props.tabs.forEach((tab,) => {
        if (!tabs.find((t) => t.props.id === tab.id)) {
          switch (tab.type) {
            case 'auth':
              [tabs,] = tabs.push(<Auth.Component flow={ tab.flow } { ...tab } key={ tab.id }></Auth.Component>);

              break;
            case 'connection':
              [tabs,] = tabs.push(<div>ok</div>);

              break;
          }
        }
      });

      setTabs(tabs);
    }
  }, [tabs]);

  return tabs;
};

export default (props) => {
  const { flow } = props;

  return <Source source={ flow.tabs } prop='tabs'>
    <TabsContent></TabsContent>
  </Source>;
};
