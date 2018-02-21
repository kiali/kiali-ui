import * as React from 'react';
import ServiceId from '../../types/ServiceId';
import Info from '../../types/ServiceInfo';
import * as API from '../../services/Api';
import { Icon, ListView, Table, ListViewItem, ListViewIcon, ListViewInfoItem } from 'patternfly-react';

type ServiceInfoState = {
  info: Info;
};

class ServiceInfo extends React.Component<ServiceId, ServiceInfoState> {
  constructor(props: ServiceId) {
    super(props);
  }

  componentWillMount() {
    console.log('Fetching info of a service...');
    API.GetServiceDetail(this.props.namespace, this.props.service)
      .then(response => {
        console.log(response);
      })
      .catch(error => {
        var data = {
          type: 'ClusterIP',
          ip: '172.30.1.1 ',
          labels: { 'docker-registry': 'default' },
          ports: [{ protocol: 'TCP', port: 443, name: 'https' }, { protocol: 'UDP', port: 53, name: 'dns' }],
          endpoints: {
            addresses: [
              { address: '172.17.0.13', kind: 'pod', name: 'docker-registry-1-779nt' },
              { address: '172.17.0.14' }
            ],
            ports: [{ protocol: 'TCP', port: 8443, name: 'https' }, { protocol: 'UDP', port: 8053, name: 'dns' }]
          },
          pods: [
            {
              name: 'router-1-pvxjw ',
              labels: {
                deployment: 'router-1',
                deploymentconfig: 'router'
              }
            }
          ],
          dependencies: [{ destination: '172.17.0.13', source: '172.30.1.1' }]
        };
        this.setState({ info: new Info(data) });
      });
  }

  componentListViewItem(type: string, name: string, text: string) {
    return (
      <ListViewInfoItem key={text}>
        <Icon type={type} name={name} />
        {text}
      </ListViewInfoItem>
    );
  }

  render() {
    var ListViewItems = [
      this.componentListViewItem('fa', 'cube', (this.state ? this.state.info.GetNumberPods() : 0) + ' Pods'),
      this.componentListViewItem('pf', 'zone', (this.state ? this.state.info.GetNumberAddresses() : 0) + ' Endpoints')
    ];

    var heading = (
      <span>
        {this.props.service}
        <small>
          <strong>Type</strong>
          : {this.state ? this.state.info.type : ''}
        </small>
      </span>
    );

    var description = <span>Ip : {this.state ? this.state.info.ip : 0}</span>;
    var headerFormat = value => {
      return (<Table.Heading>{value}</Table.Heading>);
    };
    var cellFormat = value => {
      return <Table.Cell>{value}</Table.Cell>;
    };
    const tableHeaders = (headers: any) => {
      var items = new Array();
      Object.keys(headers).forEach(function(key: string) {
        items.push(
          {
            header: {
              label: headers[key],
              formatters: [headerFormat]
            },
            cell: {
              formatters: [cellFormat]
            },
            property: key,
          }
        );
      });
      return items;
    };
    return (
      <div>
        <ListView>
          <ListViewItem
            additionalInfo={ListViewItems}
            leftContent={<ListViewIcon size="lg" type="pf" name="service" />}
            heading={heading}
            description={description}
          />
        </ListView>
        <h3>Endpoints</h3>
        <h4>Addresses</h4>
        <Table.PfProvider
          striped={true}
          bordered={true}
          columns={tableHeaders({'name': 'Name', 'address': 'Address', 'kind': 'Kind'})}
        >
          <Table.Header />
          <Table.Body rows={this.state ? this.state.info.GetAddresses() : []} rowKey="address"/>
        </Table.PfProvider>
        <h4>Ports</h4>
        <Table.PfProvider
          striped={true}
          bordered={true}
          columns={tableHeaders({'protocol': 'Protocol', 'port': 'Port', 'name': 'Name'})}
        >
          <Table.Header />
          <Table.Body rows={this.state ? this.state.info.GetPorts() : []} rowKey="name"/>
        </Table.PfProvider>
        <h3>Dependencies </h3>
        <Table.PfProvider
          striped={true}
          bordered={true}
          columns={tableHeaders({'source': 'Source', 'destination': 'Destination'})}
        >
          <Table.Header />
          <Table.Body rows={this.state ? this.state.info.dependencies : []} rowKey="source"/>
        </Table.PfProvider>
      </div>
    );
  }
}

export default ServiceInfo;
