import * as React from 'react';
import { Button, MenuItem, Icon, DropdownButton } from 'patternfly-react';
import { style } from 'typestyle';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { bindActionCreators } from 'redux';

import { KialiAppState } from '../../store/Store';
import { durationSelector, refreshIntervalSelector } from '../../store/Selectors';
import { KialiAppAction } from '../../actions/KialiAppAction';
import { UserSettingsActions } from '../../actions/UserSettingsActions';

import { DurationInSeconds, PollIntervalInMs } from '../../types/Common';

import { config } from '../../config/config';
import { HistoryManager, URLParam } from '../../app/History';
import ToolbarDropdown from '../ToolbarDropdown/ToolbarDropdown';
import { serverConfig } from '../../config/serverConfig';

//
// GraphRefresh actually handles the Duration dropdown, the RefreshInterval dropdown and the Refresh button.
//

type ReduxProps = {
  duration: DurationInSeconds;
  refreshInterval: PollIntervalInMs;

  setDuration: (duration: DurationInSeconds) => void;
  setRefreshInterval: (refreshInterval: PollIntervalInMs) => void;
};

type GraphRefreshProps = ReduxProps & {
  disabled: boolean;
  id: string;
  handleRefresh: () => void;
};

export class GraphRefresh extends React.PureComponent<GraphRefreshProps> {
  static readonly POLL_INTERVAL_LIST = config.toolbar.pollInterval;

  static readonly durationLabelStyle = style({
    paddingRight: '0.5em',
    marginLeft: '1.5em'
  });

  static readonly refreshButtonStyle = style({
    paddingLeft: '0.5em'
  });

  constructor(props: GraphRefreshProps) {
    super(props);

    // Let URL override current redux state at construction time
    const urlDuration = HistoryManager.getDuration();
    const urlPollInterval = HistoryManager.getNumericParam(URLParam.POLL_INTERVAL);
    if (urlDuration !== undefined && urlDuration !== props.duration) {
      props.setDuration(urlDuration);
    }
    if (urlPollInterval !== undefined && urlPollInterval !== props.refreshInterval) {
      props.setRefreshInterval(urlPollInterval);
    }
    HistoryManager.setParam(URLParam.DURATION, String(this.props.duration));
    HistoryManager.setParam(URLParam.POLL_INTERVAL, String(this.props.refreshInterval));
  }

  componentDidUpdate() {
    // ensure redux state and URL are aligned
    HistoryManager.setParam(URLParam.DURATION, String(this.props.duration));
    HistoryManager.setParam(URLParam.POLL_INTERVAL, String(this.props.refreshInterval));
  }

  render() {
    return (
      <>
        <label className={GraphRefresh.durationLabelStyle}>Fetching</label>
        <ToolbarDropdown
          id={'graph_filter_duration'}
          disabled={this.props.disabled}
          handleSelect={key => this.props.setDuration(Number(key))}
          value={this.props.duration}
          label={String(serverConfig.durations[this.props.duration])}
          options={serverConfig.durations}
        />
        <DropdownButton
          id="graph_refresh_dropdown"
          title={GraphRefresh.POLL_INTERVAL_LIST[this.props.refreshInterval]}
          disabled={this.props.disabled}
        >
          {Object.keys(GraphRefresh.POLL_INTERVAL_LIST).map((key: any) => {
            return (
              <MenuItem
                key={key}
                eventKey={key}
                active={Number(key) === this.props.refreshInterval}
                onSelect={value => this.props.setRefreshInterval(Number(value))}
              >
                {GraphRefresh.POLL_INTERVAL_LIST[key]}
              </MenuItem>
            );
          })}
        </DropdownButton>
        <span className={GraphRefresh.refreshButtonStyle}>
          <Button id="refresh_button" onClick={this.props.handleRefresh} disabled={this.props.disabled}>
            <Icon name="refresh" />
          </Button>
        </span>
      </>
    );
  }
}

const mapStateToProps = (state: KialiAppState) => ({
  duration: durationSelector(state),
  refreshInterval: refreshIntervalSelector(state)
});

const mapDispatchToProps = (dispatch: ThunkDispatch<KialiAppState, void, KialiAppAction>) => {
  return {
    setDuration: bindActionCreators(UserSettingsActions.setDuration, dispatch),
    setRefreshInterval: bindActionCreators(UserSettingsActions.setRefreshInterval, dispatch)
  };
};

const GraphRefreshContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GraphRefresh);

export default GraphRefreshContainer;
