import { GraphStyles } from './GraphStyles';

const XmasTree = require('../../../assets/img/xmas-tree.png');

export class GraphStylesXMas {
  static styles() {
    const styles = GraphStyles.styles() as any[];
    return styles.map(styleElement => {
      if (styleElement.selector === 'node') {
        styleElement = { ...styleElement };
        const originalBackgroundImage = styleElement.css['background-image'];
        styleElement.css = {
          ...styleElement.css,
          shape: 'polygon',
          'shape-polygon-points':
            '-0.0049201  -1.0000000  -0.1519849  -0.7859564  -0.3088899  -0.6021167  -0.4485408  -0.4853440  -0.5931792  -0.3946132  -0.4779268  -0.3188656  -0.4167284  -0.2735597  -0.5759251   -0.1632083  -0.8259756  -0.0205125  -0.7523758   0.0334740  -0.6127249   0.1113621  -0.7916021   0.1999524  -1.0000000   0.3167251  -0.9460807   0.3988941  -0.8700546   0.4723824 -0.6396846   0.5848742  -0.3529689   0.6583626  -0.1837973   0.6821452  -0.1053447   0.6864261  -0.1079059   0.9977407   0.1886500   1.0000000   0.2033430   0.6821452   0.3407023   0.6583626   0.5416863   0.6301802   0.7304037   0.5566918   0.8749073   0.4745229   1.0000000   0.3232654   0.8209881   0.2453773   0.6004583   0.1264641   0.7254162   0.0551162    0.7990160  -0.0183721   0.6102986  -0.1092217   0.3896340  -0.2540579   0.5441127  -0.3275462   0.6077374  -0.3902134   0.4558199  -0.4723824   0.2990497  -0.6021167   0.1544113 -0.7664546 -0.0049201  -1.0000000',
          width: '25px',
          height: '30px',
          'background-image': (ele: any) => {
            const original = originalBackgroundImage(ele);
            if (original === 'none') {
              return XmasTree;
            }
            return original;
          }
        };
      }
      return styleElement;
    });
  }
}
