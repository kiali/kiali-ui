import history from './History';

export class TabManager {
  tabName: string;
  defaultTab: string;
  trafficTabName?: string;
  fetchTrafficMethod?: () => void;
  tabMap: { [key: string]: number };
  private indexMap: { [key: number]: string };

  constructor(
    tabMap: { [key: string]: number },
    tabName: string,
    defaultTab: string,
    trafficTabName?: string,
    trafficMethod?: () => void
  ) {
    this.tabName = tabName;
    this.tabMap = tabMap;
    this.defaultTab = defaultTab;
    this.trafficTabName = trafficTabName;
    this.fetchTrafficMethod = trafficMethod;
    this.buildIndexMap();
  }

  buildIndexMap() {
    this.indexMap = Object.keys(this.tabMap).reduce((result: { [i: number]: string }, name: string) => {
      result[this.tabIndexOf(name)] = name;
      return result;
    }, {});
  }

  isDefaultTab(currentTab: string) {
    return currentTab === this.defaultTab;
  }

  isTrafficTab(currentTab: string) {
    return currentTab === this.trafficTabName;
  }

  tabIndexOf(tabName: string) {
    return this.tabMap[tabName];
  }

  tabNameOf(index: number) {
    return this.indexMap[index];
  }

  activeTab = () => {
    return new URLSearchParams(history.location.search).get(this.tabName) || this.defaultTab;
  };

  activeIndex = () => {
    return this.tabIndexOf(this.activeTab());
  };

  tabSelectHandler = (postHandler?: (tabName: string, trafficDataPresent: boolean) => void) => {
    return (tabKey: string, trafficDataPresent: boolean) => {
      const urlParams = new URLSearchParams('');
      urlParams.set(this.tabName, tabKey);

      history.push(history.location.pathname + '?' + urlParams.toString());

      if (postHandler) {
        postHandler(tabKey, trafficDataPresent);
      }
    };
  };

  handleTrafficDurationChange = (): (() => void) | undefined => {
    return this.fetchTrafficMethod;
  };

  tabChangeHandler = (tabValue: string, trafficDataPresent: boolean): void => {
    if (tabValue === this.trafficTabName && !trafficDataPresent) {
      return this.fetchTrafficMethod && this.fetchTrafficMethod();
    }
  };
}
