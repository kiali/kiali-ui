import * as React from 'react';
import { Tabs } from '@patternfly/react-core';
import history from '../../app/History';

type TabsProps = {
  id: string;
  tabMap: { [key: string]: number };
  tabName: string;
  defaultTab: string;
  onSelect: (tabName: string) => void;
  postHandler?: (tabName: string) => void;
};

type TabsState = {
  currentTab: string;
};

export const activeTab = (tabName: string, defaultTab: string): string => {
  return new URLSearchParams(history.location.search).get(tabName) || defaultTab;
};

export default class ParameterizedTabs extends React.Component<TabsProps, TabsState> {
  private indexMap: { [key: number]: string };

  constructor(props: TabsProps) {
    super(props);
    this.state = { currentTab: this.activeTab() };
    this.indexMap = this.buildIndexMap();
  }

  componentDidUpdate(): void {
    this.buildIndexMap();
  }

  buildIndexMap() {
    return Object.keys(this.props.tabMap).reduce((result: { [i: number]: string }, name: string) => {
      result[this.tabIndexOf(name)] = name;
      return result;
    }, {});
  }

  tabIndexOf(tabName: string) {
    return this.props.tabMap[tabName];
  }

  tabNameOf(index: number) {
    return this.indexMap[index];
  }

  activeTab = () => {
    return activeTab(this.props.tabName, this.props.defaultTab);
  };

  activeIndex = () => {
    return this.tabIndexOf(this.activeTab());
  };

  tabSelectHandler = (tabKey: string) => {
    const urlParams = new URLSearchParams('');
    urlParams.set(this.props.tabName, tabKey);

    history.push(history.location.pathname + '?' + urlParams.toString());

    if (this.props.postHandler) {
      this.props.postHandler(tabKey);
    }

    this.setState({
      currentTab: tabKey
    });
  };

  render() {
    return (
      <Tabs
        id={this.props.id}
        activeKey={this.activeIndex()}
        onSelect={(_, ek) => {
          const currentTabName = this.tabNameOf(ek);
          this.tabSelectHandler(currentTabName);
          this.props.onSelect(currentTabName);
        }}
      >
        {this.props.children}
      </Tabs>
    );
  }
}
