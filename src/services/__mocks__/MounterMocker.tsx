import * as React from 'react';
import * as API from '../Api';
import { mount, ReactWrapper } from 'enzyme';
import { Provider } from 'react-redux';
import { MemoryRouter, Route } from 'react-router';
import { store } from '../../store/ConfigStore';

export default class MounterMocker {
  private promises: Promise<void>[] = [];
  private toMount: JSX.Element = (<></>);
  private caughtErrors: string[] = [];

  constructor() {
    store.subscribe(() => {
      this.caughtErrors = [];
      const state = store.getState();
      state.messageCenter.groups.forEach(g => {
        g.messages.forEach(m => {
          this.caughtErrors.push(m.content + ' [' + m.detail + ']');
        });
      });
    });
  }

  // About nestData: set it accordingly to the object returned by API promise:
  // - if it's the Axios response directly, keep default (true) as content is encapsulated in 'data' field
  // - if it's a transformed object extracted from Axios response, set to false.
  addMock = (func: keyof typeof API, obj: any, nestData: boolean = true): MounterMocker => {
    this.promises.push(
      new Promise((resolve, reject) => {
        jest.spyOn(API, func).mockImplementation(() => {
          return new Promise(r => {
            nestData ? r({ data: obj }) : r(obj);
            setTimeout(() => {
              try {
                resolve();
              } catch (e) {
                reject(e);
              }
            }, 1);
          });
        });
      })
    );
    return this;
  };

  mount = (elem: JSX.Element): MounterMocker => {
    this.toMount = elem;
    return this;
  };

  mountWithStore = (elem: JSX.Element): MounterMocker => {
    this.toMount = (
      <Provider store={store}>
        <MemoryRouter>
          <Route render={props => React.cloneElement(elem, props)} />
        </MemoryRouter>
      </Provider>
    );
    return this;
  };

  run = (done, expect: (wrapper: ReactWrapper) => void) => {
    let wrapper: ReactWrapper;
    Promise.all(this.promises)
      .then(() => {
        wrapper.update();
        this.checkErrors();
        expect(wrapper);
        done();
      })
      .catch(done.fail);
    wrapper = mount(this.toMount);
  };

  private checkErrors() {
    if (this.caughtErrors.length > 0) {
      console.warn('MounterMocker caught some errors:' + this.caughtErrors.map(e => '\n- ' + e).join(''));
    }
  }
}
