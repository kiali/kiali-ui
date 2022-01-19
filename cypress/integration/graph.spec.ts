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
});
