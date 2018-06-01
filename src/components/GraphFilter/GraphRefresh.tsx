import * as React from 'react';
import { PollIntervalInMs } from '../../types/GraphFilter';
import { DropdownKebab, Button, MenuItem, Icon, OverlayTrigger, Tooltip } from 'patternfly-react';

type GraphRefreshProps = {
  id: string;
  handleRefresh: () => void;
  onSelect: (selected: PollIntervalInMs) => void;
  selected: PollIntervalInMs;
  options: {
    [interval: number]: string;
  };
};

const GraphRefresh: React.SFC<GraphRefreshProps> = props => {
  return (
    <>
      <OverlayTrigger
        overlay={<Tooltip id={`${props.id}_tooltip`}>{props.options[props.selected]}</Tooltip>}
        placement="top"
        trigger={['hover', 'focus']}
        rootClose={false}
      >
        <Button onClick={props.handleRefresh}>
          <Icon name="refresh" />
        </Button>
      </OverlayTrigger>
      <DropdownKebab id={props.id} pullRight={true}>
        {Object.keys(props.options).map((key: any) => {
          return (
            <MenuItem
              key={key}
              eventKey={key}
              active={Number(key) === props.selected}
              onSelect={value => props.onSelect(Number(value))}
            >
              {props.options[key]}
            </MenuItem>
          );
        })}
      </DropdownKebab>
    </>
  );
};

export default GraphRefresh;
