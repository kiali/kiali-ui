import { GraphDefinition } from '../../src/types/Graph';

describe('Graph page', () => {
  before(() => {
    // Example:
    // It's possible to execute arbitrary commands to perform environment setup
    // or do anything else necessary for running the tests.
    // cy.exec('kubectl get pods -A');
  });

  it('opens the namespace selector, selects all namespaces, and loads graph', () => {
    cy.visit('/console/graph/namespaces/?refresh=0');
    cy.selectAllNamespaces();

    cy.contains('Loading Graph');
    cy.get('.graph', { timeout: 5000 });
  });

  describe('large graphs', () => {
    const namespaces = new Set<string>();
    before(() => {
      cy.fixture('large_graph').then((graphData: GraphDefinition) => {
        graphData.elements.nodes.forEach(node => {
          if (node.data.namespace.startsWith('n')) {
            namespaces.add(node.data.namespace);
          }
        });
        cy.log('Creating namespaces...');
        namespaces.forEach(ns => {
          cy.exec(`kubectl get ns ${ns} || kubectl create namespace ${ns}`);
        });

        cy.intercept('GET', '/api/namespaces/graph*', graphData);
      });
    });

    // Cleanup
    after(() => {
      cy.log('Deleting namespaces...');
      namespaces.forEach(ns => {
        cy.exec(`kubectl delete namespace ${ns} --wait=false || true`);
      });
    });

    it('loads a large graph', () => {
      cy.visit('/console/graph/namespaces/?refresh=0');
      cy.selectAllNamespaces();

      cy.contains('Loading Graph');
      cy.get('.graph', { timeout: 60000 });
    });
  });
});
