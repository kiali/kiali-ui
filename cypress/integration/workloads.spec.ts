describe('Workloads', () => {
  it('opens the namespace selector, selects all namespaces, and loads graph', () => {
    cy.visit('/console/workloads/?refresh=0');

    cy.selectAllNamespaces();

    // Look for some known workloads
    cy.contains('kiali');
    cy.contains('istiod');
  });
});
