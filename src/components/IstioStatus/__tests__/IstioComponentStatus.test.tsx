import * as React from 'react';
import { ComponentStatus, Status } from '../../../types/IstioStatus';
import IstioComponentStatus from '../IstioComponentStatus';
import { shallowToJson } from 'enzyme-to-json';
import { shallow } from 'enzyme';

const mockComponent = (cs: ComponentStatus) => {
  return (
    shallow(
      <IstioComponentStatus componentStatus={cs} />
    )
  )
};

describe("IstioComponentStatus renders", () => {
  it("success icon when core component is running", () => {
    const wrapper = mockComponent({
      name: "isito-ingress",
      status: Status.Running,
      is_core: true,
    });

    expect(shallowToJson(wrapper)).toBeDefined();
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });

  it("error icon when core component is not running", () => {
    const wrapper = mockComponent({
      name: "isito-ingress",
      status: Status.NotRunning,
      is_core: true,
    });

    expect(shallowToJson(wrapper)).toBeDefined();
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });

  it("error icon when core component is not found", () => {
    const wrapper = mockComponent({
      name: "isito-ingress",
      status: Status.NotFound,
      is_core: true,
    });

    expect(shallowToJson(wrapper)).toBeDefined();
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });

  it("success icon when core component is running", () => {
    const wrapper = mockComponent({
      name: "prometheus",
      status: Status.Running,
      is_core: false,
    });

    expect(shallowToJson(wrapper)).toBeDefined();
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });

  it("warning icon when core component is not running", () => {
    const wrapper = mockComponent({
      name: "prometheus",
      status: Status.NotRunning,
      is_core: false,
    });

    expect(shallowToJson(wrapper)).toBeDefined();
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });

  it("warning icon when core component is not found", () => {
    const wrapper = mockComponent({
      name: "prometheus",
      status: Status.NotFound,
      is_core: false,
    });

    expect(shallowToJson(wrapper)).toBeDefined();
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });
});
