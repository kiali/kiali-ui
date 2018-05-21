import * as API from '../Api';
import { AxiosError } from 'axios';

describe('#GetAuthentication', () => {
  it('should return a correct object with username and password', () => {
    const username = 'admin';
    const password = 'admin';
    expect(API.authentication(username, password)).toEqual({ username: username, password: password });
    sessionStorage.setItem('user', username + '_fake');
    sessionStorage.setItem('password', password + '_fake');
    expect(API.authentication()).toEqual({ username: username + '_fake', password: password + '_fake' });
  });
});

describe('#GetErrorMessage', () => {
  it('should return a errorMessage', () => {
    const errormsg = 'Error sample';
    let axErr: AxiosError = {
      config: { method: 'GET' },
      name: 'AxiosError',
      message: 'Error in Response',
      response: {
        data: null,
        status: 400,
        statusText: 'InternalError',
        headers: null,
        config: {}
      }
    };
    expect(API.getErrorMsg(errormsg, axErr)).toEqual(errormsg);
    const responseServerError = 'Internal Error';
    axErr = {
      config: { method: 'GET' },
      name: 'AxiosError',
      message: 'Error in Response',
      response: {
        data: { error: responseServerError },
        status: 400,
        statusText: 'InternalError',
        headers: null,
        config: {}
      }
    };
    expect(API.getErrorMsg(errormsg, axErr)).toEqual(`${errormsg} Error: [ ${responseServerError} ]`);
  });
});

describe('#Test Methods return a Promise', () => {
  const evaluatePromise = (result: Promise<any>) => {
    expect(result).toBeDefined();
    expect(typeof result).toEqual('object');
    expect(typeof result.then).toEqual('function');
    expect(typeof result.catch).toEqual('function');
  };

  it('#login', () => {
    const result = API.login('admin', 'admin');
    evaluatePromise(result);
  });

  it('#getStatus', () => {
    const result = API.getStatus();
    evaluatePromise(result);
  });

  it('#getNamespaces', () => {
    const result = API.getNamespaces();
    evaluatePromise(result);
  });

  it('#getNamespaceMetrics', () => {
    const result = API.getNamespaceMetrics('istio-system', {});
    evaluatePromise(result);
  });

  it('#getIstioRules', () => {
    const result = API.getIstioRules('istio-system');
    evaluatePromise(result);
  });

  it('#getServices', () => {
    const result = API.getServices('istio-system');
    evaluatePromise(result);
  });

  it('#getServiceMetrics', () => {
    const result = API.getServiceMetrics('istio-system', 'book-info', {});
    evaluatePromise(result);
  });

  it('#getServiceHealth', () => {
    const result = API.getServiceHealth('istio-system', 'book-info');
    evaluatePromise(result);
  });

  it('#getGrafanaInfo', () => {
    const result = API.getGrafanaInfo();
    evaluatePromise(result);
  });

  it('#getJaegerInfo', () => {
    const result = API.getJaegerInfo();
    evaluatePromise(result);
  });

  it('#getGraphElements', () => {
    const result = API.getGraphElements({ name: 'istio-system' }, {});
    evaluatePromise(result);
  });

  it('#getServiceDetail', () => {
    const result = API.getServiceDetail('istio-system', '');
    evaluatePromise(result);
  });

  it('#getIstioRuleDetail', () => {
    const result = API.getIstioRuleDetail('istio-system', '');
    evaluatePromise(result);
  });
});
