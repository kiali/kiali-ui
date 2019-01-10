import * as React from 'react';
import { shallow } from 'enzyme';

import { GraphFind } from '../GraphFind';

const testHandler = () => {
  console.log('handled');
};

describe('Parse find value test', () => {
  it('should return the correct selector for raw find values', () => {
    const wrapper = shallow(
      <GraphFind
        cyData={{ updateTimestamp: 123, cyRef: 'dummyRef' }}
        showFindHelp={false}
        toggleFindHelp={testHandler}
      />
    );
    const instance = wrapper.instance();

    // check coverage of node operands
    expect(instance.parseFindValue('httpin > 5.0')).toEqual('node[httpIn > 5.0]');
    expect(instance.parseFindValue('httpout < 5.0')).toEqual('node[httpOut < 5.0]');
    expect(instance.parseFindValue('namespace = foo')).toEqual('node[namespace = "foo"]');
    expect(instance.parseFindValue('ns = foo')).toEqual('node[namespace = "foo"]');
    expect(instance.parseFindValue('service = foo')).toEqual('node[service = "foo"]');
    expect(instance.parseFindValue('svc = foo')).toEqual('node[service = "foo"]');
    expect(instance.parseFindValue('version = foo')).toEqual('node[version = "foo"]');
    expect(instance.parseFindValue('tcpin > 5.0')).toEqual('node[tcpIn > 5.0]');
    expect(instance.parseFindValue('tcpout < 5.0')).toEqual('node[tcpOut < 5.0]');
    expect(instance.parseFindValue('workload = foo')).toEqual('node[workload = "foo"]');
    expect(instance.parseFindValue('wl = foo')).toEqual('node[workload = "foo"]');

    expect(instance.parseFindValue('appnode')).toEqual('node[nodeType = "app"]');
    expect(instance.parseFindValue('circuitBreaker')).toEqual('node[hasCB]');
    expect(instance.parseFindValue('cb')).toEqual('node[hasCB]');
    expect(instance.parseFindValue('sidecar')).toEqual('node[^hasMissingSC]');
    expect(instance.parseFindValue('sc')).toEqual('node[^hasMissingSC]');
    expect(instance.parseFindValue('outside')).toEqual('node[isOutside]');
    expect(instance.parseFindValue('servicenode')).toEqual('node[nodeType = "service"]');
    expect(instance.parseFindValue('svcnode')).toEqual('node[nodeType = "service"]');
    expect(instance.parseFindValue('unknown')).toEqual('node[nodeType = "unknown"]');
    expect(instance.parseFindValue('unused')).toEqual('node[isUnused]');
    expect(instance.parseFindValue('virtualService')).toEqual('node[hasVS]');
    expect(instance.parseFindValue('vs')).toEqual('node[hasVS]');
    expect(instance.parseFindValue('workloadnode')).toEqual('node[nodeType = "workload"]');
    expect(instance.parseFindValue('wlnode')).toEqual('node[nodeType = "workload"]');

    // check coverage of edge operands
    expect(instance.parseFindValue('http > 5.0')).toEqual('edge[http > 5.0]');
    expect(instance.parseFindValue('%error > 50')).toEqual('edge[httpPercentErr > 50]');
    expect(instance.parseFindValue('%err > 50')).toEqual('edge[httpPercentErr > 50]');
    expect(instance.parseFindValue('%traffic > 50')).toEqual('edge[httpPercentReq > 50]');
    expect(instance.parseFindValue('responseTime > 5.0')).toEqual('edge[responseTime > 5.0]');
    expect(instance.parseFindValue('rt > 5.0')).toEqual('edge[responseTime > 5.0]');
    expect(instance.parseFindValue('tcp > 5.0')).toEqual('edge[tcp > 5.0]');

    expect(instance.parseFindValue('mtls')).toEqual('edge[isMTLS]');

    // check all numeric operators
    expect(instance.parseFindValue('httpin < 5.0')).toEqual('node[httpIn < 5.0]');
    expect(instance.parseFindValue('httpin <= 5.0')).toEqual('node[httpIn <= 5.0]');
    expect(instance.parseFindValue('httpin > 5.0')).toEqual('node[httpIn > 5.0]');
    expect(instance.parseFindValue('httpin >= 5.0')).toEqual('node[httpIn >= 5.0]');
    expect(instance.parseFindValue('httpin = 5.0')).toEqual('node[httpIn = "5.0"]');
    expect(instance.parseFindValue('httpin != 5.0')).toEqual('node[httpIn != "5.0"]');

    // check all string operators
    expect(instance.parseFindValue('namespace = foo')).toEqual('node[namespace = "foo"]');
    expect(instance.parseFindValue('namespace *= foo')).toEqual('node[namespace *= "foo"]');
    expect(instance.parseFindValue('namespace ^= foo')).toEqual('node[namespace ^= "foo"]');
    expect(instance.parseFindValue('namespace $= foo')).toEqual('node[namespace $= "foo"]');
    expect(instance.parseFindValue('namespace != foo')).toEqual('node[namespace != "foo"]');
    expect(instance.parseFindValue('namespace !*= foo')).toEqual('node[namespace !*= "foo"]');
    expect(instance.parseFindValue('namespace !^= foo')).toEqual('node[namespace !^= "foo"]');
    expect(instance.parseFindValue('namespace !$= foo')).toEqual('node[namespace !$= "foo"]');
    expect(instance.parseFindValue('namespace contains foo')).toEqual('node[namespace *= "foo"]');
    expect(instance.parseFindValue('namespace startsWith foo')).toEqual('node[namespace ^= "foo"]');
    expect(instance.parseFindValue('namespace endsWith foo')).toEqual('node[namespace $= "foo"]');
    expect(instance.parseFindValue('namespace not contains foo')).toEqual('node[namespace !*= "foo"]');
    expect(instance.parseFindValue('namespace not startswith foo')).toEqual('node[namespace !^= "foo"]');
    expect(instance.parseFindValue('namespace not endswith foo')).toEqual('node[namespace !$= "foo"]');

    // check unary parsing
    expect(instance.parseFindValue('is mtls')).toEqual('edge[isMTLS]');
    expect(instance.parseFindValue('has mtls')).toEqual('edge[isMTLS]');
    expect(instance.parseFindValue('! mtls')).toEqual('edge[^isMTLS]');
    expect(instance.parseFindValue('!has mtls')).toEqual('edge[^isMTLS]');
    expect(instance.parseFindValue('!mtls')).toEqual('edge[^isMTLS]');
    expect(instance.parseFindValue('not has mtls')).toEqual('edge[^isMTLS]');

    // check binary parsing
    expect(instance.parseFindValue('ns =foo')).toEqual('node[namespace = "foo"]');
    expect(instance.parseFindValue('ns= foo')).toEqual('node[namespace = "foo"]');
    expect(instance.parseFindValue('ns  =  foo')).toEqual('node[namespace = "foo"]');
    expect(instance.parseFindValue('ns=foo')).toEqual('node[namespace = "foo"]');
    expect(instance.parseFindValue('ns not =foo')).toEqual('node[namespace != "foo"]');
    expect(instance.parseFindValue('ns!=foo')).toEqual('node[namespace != "foo"]');
    expect(instance.parseFindValue('ns not contains foo')).toEqual('node[namespace !*= "foo"]');
    expect(instance.parseFindValue('ns !contains foo')).toEqual('node[namespace !*= "foo"]');
    expect(instance.parseFindValue('ns ! contains foo')).toEqual('node[namespace !*= "foo"]');

    // check composites
    expect(instance.parseFindValue('ns=foo OR ns=bar')).toEqual('node[namespace = "foo"],[namespace = "bar"]');
    expect(instance.parseFindValue('ns=foo AND ns=bar')).toEqual('node[namespace = "foo"][namespace = "bar"]');

    // check find by name
    expect(instance.parseFindValue('foo')).toEqual('node[workload *= "foo"],[app *= "foo"],[service *= "foo"]');
    expect(instance.parseFindValue('!foo')).toEqual('node[workload !*= "foo"][app !*= "foo"][service !*= "foo"]');
    expect(instance.parseFindValue('name = foo')).toEqual('node[workload = "foo"],[app = "foo"],[service = "foo"]');
    expect(instance.parseFindValue('name != foo')).toEqual('node[workload != "foo"][app != "foo"][service != "foo"]');

    // check violations
    expect(instance.parseFindValue('ns=foo OR ns=bar AND app=foo')).toEqual(undefined); // AND and OR
    expect(instance.parseFindValue('ns=foo AND http > 5.0')).toEqual(undefined); // Node and Edge
  });
});
