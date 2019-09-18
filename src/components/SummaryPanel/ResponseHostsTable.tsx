import * as React from 'react';
import _ from 'lodash';
import { Responses } from '../../types/Graph';

type ResponseHostsTableProps = {
  responses: Responses;
  title: string;
};

interface Row {
  code: string;
  host: string;
  key: string;
  val: string;
}

export class ResponseHostsTable extends React.PureComponent<ResponseHostsTableProps> {
  render() {
    const rows = this.getRows(this.props.responses);

    return (
      <>
        {rows.length > 0 ? (
          <>
            <strong>{this.props.title}</strong>
            <table className="table">
              <thead>
                <tr key="table-header">
                  <th>Code</th>
                  <th>Host</th>
                  <th>% of Requests</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.key}>
                    <td>{row.code}</td>
                    <td>{row.host}</td>
                    <td>{row.val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <>No Host Information (see FAQ)</>
        )}
      </>
    );
  }

  private getRows = (responses: Responses): Row[] => {
    const rows: Row[] = [];
    _.keys(responses).forEach(code => {
      _.keys(responses[code].hosts).forEach(h => {
        rows.push({ key: `${code} ${h}`, code: code, host: h, val: responses[code].hosts[h] });
      });
    });
    return rows;
  };
}
