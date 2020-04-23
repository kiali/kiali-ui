import * as React from 'react';
import { cellWidth, ICell, Table, TableBody, TableHeader } from '@patternfly/react-table';
// Use TextInputBase like workaround while PF4 team work in https://github.com/patternfly/patternfly-react/issues/4072
import { Button, FormSelect, FormSelectOption, TextInputBase as TextInput } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

type Props = {
  onAddFrom: (source: { [key: string]: string[] }) => void;
};

type State = {
  sourceFields: string[];
  source: {
    [key: string]: string[];
  };
  newSourceField: string;
  newValues: string;
};

const INIT_SOURCE_FIELDS = [
  'principals',
  'notPrincipals',
  'requestPrincipals',
  'notRequestPrincipals',
  'namespaces',
  'notNamespaces',
  'ipBlocks',
  'notIpBlocks'
].sort();

const headerCells: ICell[] = [
  {
    title: 'Source Field',
    transforms: [cellWidth(20) as any],
    props: {}
  },
  {
    title: 'Values',
    transforms: [cellWidth(80) as any],
    props: {}
  },
  {
    title: '',
    props: {}
  }
];

class SourceBuilder extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      sourceFields: Object.assign([], INIT_SOURCE_FIELDS),
      source: {},
      newSourceField: INIT_SOURCE_FIELDS[0],
      newValues: ''
    };
  }

  onAddNewSourceField = (value: string, _) => {
    this.setState({
      newSourceField: value
    });
  };

  onAddNewValues = (value: string, _) => {
    this.setState({
      newValues: value
    });
  };

  onAddSource = () => {
    this.setState(prevState => {
      const i = prevState.sourceFields.indexOf(prevState.newSourceField);
      if (i > -1) {
        prevState.sourceFields.splice(i, 1);
      }
      prevState.source[prevState.newSourceField] = prevState.newValues.split(',');
      return {
        sourceFields: prevState.sourceFields,
        source: prevState.source,
        newSourceField: prevState.sourceFields[0],
        newValues: ''
      };
    });
  };

  onAddSourceFromList = () => {
    const fromItem = this.state.source;
    this.setState(
      {
        sourceFields: Object.assign([], INIT_SOURCE_FIELDS),
        source: {},
        newSourceField: INIT_SOURCE_FIELDS[0],
        newValues: ''
      },
      () => {
        this.props.onAddFrom(fromItem);
      }
    );
  };

  // @ts-ignore
  actionResolver = (rowData, { rowIndex }) => {
    const removeAction = {
      title: 'Remove Field',
      // @ts-ignore
      onClick: (event, rowIndex, rowData, extraData) => {
        // Fetch sourceField from rowData, it's a fixed string on children
        const removeSourceField = rowData.cells[0].props.children.toString();
        this.setState(prevState => {
          prevState.sourceFields.push(removeSourceField);
          delete prevState.source[removeSourceField];
          const newSourceFields = prevState.sourceFields.sort();
          return {
            sourceFields: newSourceFields,
            source: prevState.source,
            newSourceField: newSourceFields[0],
            newValues: ''
          };
        });
      }
    };
    if (rowIndex < Object.keys(this.state.source).length) {
      return [removeAction];
    }
    return [];
  };

  rows = () => {
    return Object.keys(this.state.source)
      .map((sourceField, i) => {
        return {
          key: 'sourceKey' + i,
          cells: [<>{sourceField}</>, <>{this.state.source[sourceField].join(',')}</>, <></>]
        };
      })
      .concat([
        {
          key: 'sourceKeyNew',
          cells: [
            <>
              <FormSelect
                value={this.state.newSourceField}
                id="addNewSourceField"
                name="addNewSourceField"
                onChange={this.onAddNewSourceField}
              >
                {this.state.sourceFields.map((option, index) => (
                  <FormSelectOption isDisabled={false} key={'source' + index} value={option} label={option} />
                ))}
              </FormSelect>
            </>,
            <>
              <TextInput
                value={this.state.newValues}
                type="text"
                id="addNewValues"
                key="addNewValues"
                aria-describedby="add new source values"
                name="addNewValues"
                onChange={this.onAddNewValues}
              />
            </>,
            <>
              {this.state.sourceFields.length > 0 && (
                <Button variant="link" icon={<PlusCircleIcon />} onClick={this.onAddSource} />
              )}
            </>
          ]
        }
      ]);
  };

  render() {
    return (
      <>
        <Table
          aria-label="Source Builder"
          cells={headerCells}
          rows={this.rows()}
          // @ts-ignore
          actionResolver={this.actionResolver}
        >
          <TableHeader />
          <TableBody />
        </Table>
        <Button
          variant="link"
          icon={<PlusCircleIcon />}
          isDisabled={Object.keys(this.state.source).length === 0}
          onClick={this.onAddSourceFromList}
        >
          Add Source to From List
        </Button>
      </>
    );
  }
}

export default SourceBuilder;
