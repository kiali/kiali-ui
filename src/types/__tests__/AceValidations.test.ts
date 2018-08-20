import { Validations } from '../IstioObjects';
import { parseAceValidations } from '../AceValidations';

const fs = require('fs');

const destinationRuleValidations: Validations = {
  destinationrule: {
    details: {
      name: 'details',
      objectType: 'destinationrule',
      valid: false,
      checks: [
        {
          message: "Host doesn't have a valid service",
          severity: 'error',
          path: 'spec/host'
        }
      ]
    }
  }
};

const vsInvalidHosts: Validations = {
  virtualservice: {
    productpage: {
      name: 'productpage',
      objectType: 'virtualservice',
      valid: false,
      checks: [
        {
          message: "Hosts doesn't have a valid service",
          severity: 'error',
          path: 'spec/hosts'
        }
      ]
    }
  }
};

const vsInvalidHttpFirstRoute: Validations = {
  virtualservice: {
    productpage: {
      name: 'productpage',
      objectType: 'virtualservice',
      valid: false,
      checks: [
        {
          message: 'All routes should have weight',
          severity: 'error',
          path: 'spec/http[0]/route'
        }
      ]
    }
  }
};

const vsInvalidHttpSecondRoute: Validations = {
  virtualservice: {
    productpage: {
      name: 'productpage',
      objectType: 'virtualservice',
      valid: false,
      checks: [
        {
          message: 'All routes should have weight',
          severity: 'error',
          path: 'spec/http[1]/route'
        }
      ]
    }
  }
};

const vsInvalidHttpThirdRoute: Validations = {
  virtualservice: {
    productpage: {
      name: 'productpage',
      objectType: 'virtualservice',
      valid: false,
      checks: [
        {
          message: 'All routes should have weight',
          severity: 'error',
          path: 'spec/http[2]/route'
        }
      ]
    }
  }
};

const vsInvalidHttpSecondSecondDestinationField: Validations = {
  virtualservice: {
    productpage: {
      name: 'productpage',
      objectType: 'virtualservice',
      valid: false,
      checks: [
        {
          message: 'Destination field is mandatory',
          severity: 'error',
          path: 'spec/http[1]/route[1]'
        }
      ]
    }
  }
};

const vsInvalidHttpThirdFirstDestinationField: Validations = {
  virtualservice: {
    productpage: {
      name: 'productpage',
      objectType: 'virtualservice',
      valid: false,
      checks: [
        {
          message: 'Destination field is mandatory',
          severity: 'error',
          path: 'spec/http[2]/route[0]'
        }
      ]
    }
  }
};

const vsInvalidHttpThirdFirstSubsetNotFound: Validations = {
  virtualservice: {
    productpage: {
      name: 'productpage',
      objectType: 'virtualservice',
      valid: false,
      checks: [
        {
          message: 'Subset not found',
          severity: 'warning',
          path: 'spec/http[2]/route[0]/destination'
        }
      ]
    }
  }
};

const vsInvalidHttpFirstSecondSubsetNotFound: Validations = {
  virtualservice: {
    productpage: {
      name: 'productpage',
      objectType: 'virtualservice',
      valid: false,
      checks: [
        {
          message: 'Subset not found',
          severity: 'warning',
          path: 'spec/http[0]/route[1]/destination'
        }
      ]
    }
  }
};

const vsInvalidHttpFourthFirstWeigth: Validations = {
  virtualservice: {
    productpage: {
      name: 'productpage',
      objectType: 'virtualservice',
      valid: false,
      checks: [
        {
          message: 'Weight must be a number',
          severity: 'warning',
          path: 'spec/http[3]/route[0]/weigth/25a'
        }
      ]
    }
  }
};

const vsInvalidHttpFifthSecondWeigth: Validations = {
  virtualservice: {
    productpage: {
      name: 'productpage',
      objectType: 'virtualservice',
      valid: false,
      checks: [
        {
          message: 'Weight must be a number',
          severity: 'warning',
          path: 'spec/http[4]/route[1]/weigth/28a'
        }
      ]
    }
  }
};

const destinationRuleYaml = fs.readFileSync(`./src/types/__testData__/destinationRule.yaml`).toString();
const virtualServiceYaml = fs.readFileSync(`./src/types/__testData__/virtualService.yaml`).toString();

describe('#parseAceValidations in DestinationRule', () => {
  it('should mark an invalid host', () => {
    const aceValidations = parseAceValidations(destinationRuleYaml, destinationRuleValidations);
    expect(aceValidations).toBeDefined();
    expect(aceValidations.markers.length).toBe(1);
    expect(aceValidations.annotations.length).toBe(1);

    /*
    Check it marks lines 3-4 (starting to count in 0 instead of 1)
      host: details
   */
    let marker = aceValidations.markers[0];
    expect(marker).toBeDefined();
    expect(marker.startRow).toEqual(3);
    expect(marker.endRow).toEqual(4);
    expect(marker.startCol).toEqual(0);
    expect(marker.endCol).toEqual(0);

    let annotation = aceValidations.annotations[0];
    expect(annotation).toBeDefined();
    expect(annotation.column).toEqual(0);
    expect(annotation.row).toEqual(3);
    expect(annotation.type).toEqual('error');
    expect(annotation.text).toEqual("Host doesn't have a valid service");
  });
});

describe('#parseAceValidations in VirtualService', () => {
  it('should detect invalid hosts', () => {
    const aceValidations = parseAceValidations(virtualServiceYaml, vsInvalidHosts);
    expect(aceValidations).toBeDefined();
    expect(aceValidations.markers.length).toBe(1);
    expect(aceValidations.annotations.length).toBe(1);
    /*
    Check it marks lines 3-5 (starting to count in 0):
      hosts:
        - productpage
   */
    let marker = aceValidations.markers[0];
    expect(marker).toBeDefined();
    expect(marker.startRow).toEqual(3);
    expect(marker.endRow).toEqual(5);
    expect(marker.startCol).toEqual(0);
    expect(marker.endCol).toEqual(0);

    let annotation = aceValidations.annotations[0];
    expect(annotation).toBeDefined();
    expect(annotation.column).toEqual(0);
    expect(annotation.row).toEqual(3);
    expect(annotation.type).toEqual('error');
    expect(annotation.text).toEqual("Hosts doesn't have a valid service");
  });

  it('should detect invalid first http route', () => {
    const aceValidations = parseAceValidations(virtualServiceYaml, vsInvalidHttpFirstRoute);
    expect(aceValidations).toBeDefined();
    expect(aceValidations.markers.length).toBe(1);
    expect(aceValidations.annotations.length).toBe(1);
    /*
    Check it marks lines 12-19 (starting to count in 0):
      route:
        - destination:
          name: productpage
          subset: v1
        - destination:
          name: productpage
          subset: v2
   */
    let marker = aceValidations.markers[0];
    expect(marker).toBeDefined();
    expect(marker.startRow).toBe(12);
    expect(marker.endRow).toBe(19);
    expect(marker.startCol).toBe(4);
    expect(marker.endCol).toBe(0);

    let annotation = aceValidations.annotations[0];
    expect(annotation).toBeDefined();
    expect(annotation.column).toBe(0);
    expect(annotation.row).toBe(12);
    expect(annotation.type).toBe('error');
    expect(annotation.text).toBe('All routes should have weight');
  });

  it('should detect invalid second http route', () => {
    const aceValidations = parseAceValidations(virtualServiceYaml, vsInvalidHttpSecondRoute);
    expect(aceValidations).toBeDefined();
    expect(aceValidations.markers.length).toBe(1);
    expect(aceValidations.annotations.length).toBe(1);
    /*
    Check it marks lines 22-29 (starting to count in 0):
      route:
        - destination:
          name: productpage
          subset: v3
        - destination:
          name: productpage
          subset: v4
   */
    let marker = aceValidations.markers[0];
    expect(marker).toBeDefined();
    expect(marker.startRow).toEqual(22);
    expect(marker.endRow).toEqual(29);
    expect(marker.startCol).toEqual(4);
    expect(marker.endCol).toEqual(0);

    let annotation = aceValidations.annotations[0];
    expect(annotation).toBeDefined();
    expect(annotation.column).toEqual(0);
    expect(annotation.row).toEqual(22);
    expect(annotation.type).toEqual('error');
    expect(annotation.text).toEqual('All routes should have weight');
  });

  it('should detect invalid third http route', () => {
    const aceValidations = parseAceValidations(virtualServiceYaml, vsInvalidHttpThirdRoute);
    expect(aceValidations).toBeDefined();
    expect(aceValidations.markers.length).toBe(1);
    expect(aceValidations.annotations.length).toBe(1);
    /*
    Check it marks lines 32-39 (starting to count in 0):
      route:
        - destination:
          name: productpage
          subset: v5
        - destination:
          name: productpage
          subset: v6
   */
    let marker = aceValidations.markers[0];
    expect(marker).toBeDefined();
    expect(marker.startRow).toEqual(32);
    expect(marker.endRow).toEqual(39);
    expect(marker.startCol).toEqual(4);
    expect(marker.endCol).toEqual(0);

    let annotation = aceValidations.annotations[0];
    expect(annotation).toBeDefined();
    expect(annotation.column).toEqual(0);
    expect(annotation.row).toEqual(32);
    expect(annotation.type).toEqual('error');
    expect(annotation.text).toEqual('All routes should have weight');
  });

  it('should detect invalid second http second destination field', () => {
    const aceValidations = parseAceValidations(virtualServiceYaml, vsInvalidHttpSecondSecondDestinationField);
    expect(aceValidations).toBeDefined();
    expect(aceValidations.markers.length).toBe(1);
    expect(aceValidations.annotations.length).toBe(1);
    /*
    Check it marks lines 26-29 (starting to count in 0):
      - destination:
            name: productpage
            subset: v4
   */
    let marker = aceValidations.markers[0];
    expect(marker).toBeDefined();
    expect(marker.startRow).toEqual(26);
    expect(marker.endRow).toEqual(29);
    expect(marker.startCol).toEqual(4);
    expect(marker.endCol).toEqual(0);

    let annotation = aceValidations.annotations[0];
    expect(annotation).toBeDefined();
    expect(annotation.column).toEqual(0);
    expect(annotation.row).toEqual(26);
    expect(annotation.type).toEqual('error');
    expect(annotation.text).toEqual('Destination field is mandatory');
  });

  it('should detect invalid third http first destination field', () => {
    const aceValidations = parseAceValidations(virtualServiceYaml, vsInvalidHttpThirdFirstDestinationField);
    expect(aceValidations).toBeDefined();
    expect(aceValidations.markers.length).toBe(1);
    expect(aceValidations.annotations.length).toBe(1);
    /*
    Check it marks lines 33-36 (starting to count in 0):
      - destination:
            name: productpage
            subset: v4
   */
    let marker = aceValidations.markers[0];
    expect(marker).toBeDefined();
    expect(marker.startRow).toEqual(33);
    expect(marker.endRow).toEqual(36);
    expect(marker.startCol).toEqual(6);
    expect(marker.endCol).toEqual(0);

    let annotation = aceValidations.annotations[0];
    expect(annotation).toBeDefined();
    expect(annotation.column).toEqual(0);
    expect(annotation.row).toEqual(33);
    expect(annotation.type).toEqual('error');
    expect(annotation.text).toEqual('Destination field is mandatory');
  });

  it('should detect invalid third http first destination field subset not found', () => {
    const aceValidations = parseAceValidations(virtualServiceYaml, vsInvalidHttpThirdFirstSubsetNotFound);
    expect(aceValidations).toBeDefined();
    expect(aceValidations.markers.length).toBe(1);
    expect(aceValidations.annotations.length).toBe(1);
    /*
      Check it marks lines 33-36 (starting to count in 0):
        - destination:
              name: productpage
              subset: v4
     */
    let marker = aceValidations.markers[0];
    expect(marker).toBeDefined();
    expect(marker.startRow).toEqual(33);
    expect(marker.endRow).toEqual(36);
    expect(marker.startCol).toEqual(8);
    expect(marker.endCol).toEqual(0);

    let annotation = aceValidations.annotations[0];
    expect(annotation).toBeDefined();
    expect(annotation.column).toEqual(0);
    expect(annotation.row).toEqual(33);
    expect(annotation.type).toEqual('warning');
    expect(annotation.text).toEqual('Subset not found');
  });

  it('should detect invalid first http second destination field subset not found', () => {
    const aceValidations = parseAceValidations(virtualServiceYaml, vsInvalidHttpFirstSecondSubsetNotFound);
    expect(aceValidations).toBeDefined();
    expect(aceValidations.markers.length).toBe(1);
    expect(aceValidations.annotations.length).toBe(1);
    /*
      Check it marks lines 16-19 (starting to count in 0):
        - destination:
              name: productpage
              subset: v4
     */
    let marker = aceValidations.markers[0];
    expect(marker).toBeDefined();
    expect(marker.startRow).toEqual(16);
    expect(marker.endRow).toEqual(19);
    expect(marker.startCol).toEqual(8);
    expect(marker.endCol).toEqual(0);

    let annotation = aceValidations.annotations[0];
    expect(annotation).toBeDefined();
    expect(annotation.column).toEqual(0);
    expect(annotation.row).toEqual(16);
    expect(annotation.type).toEqual('warning');
    expect(annotation.text).toEqual('Subset not found');
  });

  it('should detect invalid fourth http first weight', () => {
    const aceValidations = parseAceValidations(virtualServiceYaml, vsInvalidHttpFourthFirstWeigth);
    expect(aceValidations).toBeDefined();
    expect(aceValidations.markers.length).toBe(1);
    expect(aceValidations.annotations.length).toBe(1);
    /*
      Check it marks lines 46-47 (starting to count in 0):
        weight: 25a
     */
    let marker = aceValidations.markers[0];
    expect(marker).toBeDefined();
    expect(marker.startRow).toEqual(46);
    expect(marker.endRow).toEqual(47);
    expect(marker.startCol).toEqual(16);
    expect(marker.endCol).toEqual(0);

    let annotation = aceValidations.annotations[0];
    expect(annotation).toBeDefined();
    expect(annotation.column).toEqual(0);
    expect(annotation.row).toEqual(46);
    expect(annotation.type).toEqual('warning');
    expect(annotation.text).toEqual('Weight must be a number');
  });

  it('should detect invalid fifth http second weight', () => {
    const aceValidations = parseAceValidations(virtualServiceYaml, vsInvalidHttpFifthSecondWeigth);
    expect(aceValidations).toBeDefined();
    expect(aceValidations.markers.length).toEqual(1);
    expect(aceValidations.annotations.length).toEqual(1);
    /*
      Check it marks lines 62-63 (starting to count in 0):
        weight: 28a
     */
    let marker = aceValidations.markers[0];
    expect(marker).toBeDefined();
    expect(marker.startRow).toEqual(62);
    expect(marker.endRow).toEqual(63);
    expect(marker.startCol).toEqual(16);
    expect(marker.endCol).toEqual(0);

    let annotation = aceValidations.annotations[0];
    expect(annotation).toBeDefined();
    expect(annotation.column).toEqual(0);
    expect(annotation.row).toEqual(62);
    expect(annotation.type).toEqual('warning');
    expect(annotation.text).toEqual('Weight must be a number');
  });
});
