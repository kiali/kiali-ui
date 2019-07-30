import history from './History';

export class TabManager {
  tabName: string;
  defaultTab: string;
  trafficTabName: string;
  fetchTrafficMethod: () => void;

  constructor(tabName: string, defaultTab: string, trafficTabName: string, trafficMethod: () => void) {
    this.tabName = tabName;
    this.defaultTab = defaultTab;
    this.trafficTabName = trafficTabName;
    this.fetchTrafficMethod = trafficMethod;
  }

  isDefaultTab(currentTab: string) {
    return currentTab === this.defaultTab;
  }

  isTrafficTab(currentTab: string) {
    return currentTab === this.trafficTabName;
  }

  activeTab = () => {
    return new URLSearchParams(history.location.search).get(this.tabName) || this.defaultTab;
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

  handleTrafficDurationChange = (): (() => void) => {
    return this.fetchTrafficMethod;
  };

  tabChangeHandler = (tabValue: string, trafficDataPresent: boolean): void => {
    if (tabValue === this.trafficTabName && !trafficDataPresent) {
      return this.fetchTrafficMethod();
    }
  };
}
