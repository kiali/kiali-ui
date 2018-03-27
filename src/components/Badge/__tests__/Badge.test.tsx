import * as React from 'react';
import { shallow } from 'enzyme';
import Badge from '../Badge';

const mockBadge = (leftText = 'my_key', rightText = 'my_value', scale = 0.8, style = 'plastic', color = 'green') => {
  let component = <Badge scale={scale} style={style} color={color} leftText={leftText} rightText={rightText} />;
  return shallow(component);
};

describe('#Badge render correctly with data', () => {
  it('should render badge', () => {
    const wrapper = mockBadge();
    expect(wrapper).toBeDefined();
    expect(wrapper.name()).toEqual('svg');
  });

  it('should render default props', () => {
    const wrapper = mockBadge();
    expect(wrapper.props().zoomAndPan).toEqual('magnify');
    expect(wrapper.props().preserveAspectRatio).toEqual('xMidYMid meet');
    expect(wrapper.props().xmlns).toEqual('http://www.w3.org/2000/svg');
    expect(wrapper.props().version).toEqual('1.0');
    expect(wrapper.props().style).toEqual({ marginLeft: '5px' });
  });

  it('should render correct size', () => {
    let scale = 0.8;
    let minorMargin = scale;
    let majorMargin = 5 * scale;
    let textMargin = minorMargin + majorMargin;
    let fullWidth = textMargin * 4;
    const wrapper = mockBadge();
    expect(wrapper.props().height).toEqual(20 * scale);
    expect(wrapper.props().width).toEqual(fullWidth);
  });

  it('should scale', () => {
    let scale = 1.2;
    let minorMargin = scale;
    let majorMargin = 5 * scale;
    let textMargin = minorMargin + majorMargin;
    let fullWidth = textMargin * 4;
    const wrapper = mockBadge('leftText', 'rightText', scale);
    expect(wrapper.props().height).toEqual(20 * scale);
    expect(wrapper.props().width).toEqual(fullWidth);
  });

  it('should render with text provided', () => {
    let leftText = 'My left text';
    let rightText = 'My right text';
    let wrapper = mockBadge();
    expect(wrapper.text()).not.toContain(leftText);
    expect(wrapper.text()).not.toContain(rightText);
    wrapper = mockBadge(leftText, rightText);
    expect(wrapper.text()).toContain(leftText);
    expect(wrapper.text()).toContain(rightText);
    expect(wrapper.find('text').getElements()[1].props.children).toEqual(leftText);
    expect(wrapper.find('text').getElements()[3].props.children).toEqual(rightText);
  });

  it('should render with style provided', () => {
    let wrapper = mockBadge();
    let linearGradient = wrapper.find('linearGradient').props();
    expect(linearGradient.x2).toEqual('0');
    expect(linearGradient.y2).toEqual('100%');
    if (linearGradient.children) {
      expect(linearGradient.children[0].props.stopOpacity).toEqual('.1');
      expect(linearGradient.children[0].props.stopColor).toEqual('#bbb');
      expect(linearGradient.children[0].props.offset).toEqual('0');
      expect(linearGradient.children[1].props.stopOpacity).toEqual('.1');
      expect(linearGradient.children[1].props.offset).toEqual('1');
    }
    wrapper = mockBadge('', '', 0.8, 'another_style');
    linearGradient = wrapper.find('linearGradient').props();
    expect(linearGradient.x2).toEqual('0');
    expect(linearGradient.y2).toEqual('0');
    if (linearGradient.children) {
      expect(linearGradient.children[0].props.stopOpacity).toEqual('.1');
      expect(linearGradient.children[0].props.stopColor).toEqual('#bbb');
      expect(linearGradient.children[0].props.offset).toEqual('0');
      expect(linearGradient.children[1].props.stopOpacity).toEqual('.1');
      expect(linearGradient.children[1].props.offset).toEqual('1');
    }
  });

  it('should render with a correct rect elements', () => {
    let scale = 1.1;
    let styleType = 'square';
    let color = 'red';
    let minorMargin = scale;
    let majorMargin = 5 * scale;
    let textMargin = minorMargin + majorMargin;
    let fullWidth = textMargin * 4;
    let rightOffset = textMargin * 2;
    let rightWidth = textMargin * 2;
    let height = 20 * scale;
    let borderRadius = 3 * scale * (styleType === 'square' ? 0 : 1);
    const wrapper = mockBadge('', '', scale, styleType, color);
    let rects = wrapper.find('rect').getElements();
    expect(rects[0].props.rx).toEqual(borderRadius);
    expect(rects[0].props.fill).toEqual('#555');
    expect(rects[0].props.width).toEqual(fullWidth);
    expect(rects[0].props.height).toEqual(height);

    expect(rects[1].props.rx).toEqual(borderRadius);
    expect(rects[1].props.x).toEqual(rightOffset);
    expect(rects[1].props.fill).toEqual(color);
    expect(rects[1].props.width).toEqual(rightWidth);
    expect(rects[1].props.height).toEqual(height);

    expect(rects[2].props.x).toEqual(rightOffset);
    expect(rects[2].props.fill).toEqual(color);
    expect(rects[2].props.width).toEqual('13');
    expect(rects[2].props.height).toEqual(height);

    expect(rects[3].props.rx).toEqual(borderRadius);
    expect(rects[3].props.fill).toEqual('url(#a)');
    expect(rects[3].props.width).toEqual(fullWidth);
    expect(rects[3].props.height).toEqual(height);
  });

  it('should render with a font type', () => {
    let scale = 1.1;
    const wrapper = mockBadge('', '', scale);
    let textSize = 11 * scale;
    let gElement = wrapper.find('g').getElements()[0];
    expect(gElement.props.fontSize).toEqual(textSize);
    expect(gElement.props.fontFamily).toEqual('DejaVu Sans,Verdana,Geneva,sans-serif');
    expect(gElement.props.fill).toEqual('#fff');
  });

  it('should render text elements with correct size and props', () => {
    let scale = 1;
    let minorMargin = scale;
    let majorMargin = 5 * scale;
    let textMargin = minorMargin + majorMargin;
    let rightOffset = textMargin * 2;
    let height = 20 * scale;
    const wrapper = mockBadge('', '', scale);
    let firstText = wrapper.find('text').getElements()[0];
    expect(firstText.props.x).toEqual(textMargin);
    expect(firstText.props.y).toEqual(height - majorMargin);
    expect(firstText.props.fill).toEqual('#010101');
    expect(firstText.props.fillOpacity).toEqual('.3');
    let secondText = wrapper.find('text').getElements()[1];
    expect(secondText.props.x).toEqual(textMargin);
    expect(secondText.props.y).toEqual(height - majorMargin - minorMargin);
    let thirdText = wrapper.find('text').getElements()[2];
    expect(thirdText.props.x).toEqual(rightOffset + textMargin);
    expect(thirdText.props.y).toEqual(height - majorMargin);
    expect(thirdText.props.fill).toEqual('#010101');
    expect(thirdText.props.fillOpacity).toEqual('.3');
    let fourthText = wrapper.find('text').getElements()[3];
    expect(fourthText.props.x).toEqual(rightOffset + textMargin);
    expect(fourthText.props.y).toEqual(height - majorMargin - minorMargin);
  });
});
