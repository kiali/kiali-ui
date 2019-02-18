import { Component, KialiAppState } from '../store/Store';
import { connect } from 'react-redux';
import ServiceDetailsPage from '../pages/ServiceDetails/ServiceDetailsPage';

const getJaegerUrl = (components: Component[]) => {
  const jaegerinfo = components.find(comp => comp.name === 'Jaeger');
  return jaegerinfo ? jaegerinfo.url : '';
};

const getJaegerSupportMulns = (components: Component[]) => {
  const istioComponent = components.find(comp => comp.name === 'Istio');
  if (istioComponent && istioComponent.version) {
    const versions = istioComponent.version.split('.');
    if (+versions[0] >= 1 && +versions[1] >= 1) {
      return true;
    }
  }
  return false;
};

const mapStateToProps = (state: KialiAppState) => ({
  jaegerUrl: getJaegerUrl(state.statusState.components),
  jaegerSupportMulns: getJaegerSupportMulns(state.statusState.components)
});

const ServiceDetailsPageContainer = connect(mapStateToProps)(ServiceDetailsPage);
export default ServiceDetailsPageContainer;
