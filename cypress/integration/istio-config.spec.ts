describe('IstioConfig page', () => {
  it('opens the namespace selector, selects all namespaces, and loads graph', () => {
    cy.visit('/console/istio/?refresh=0');

    cy.selectAllNamespaces();

    // Look for some known workloads
    cy.get('a[href*="bookinfo"').first().click();
    cy.get('#ace-editor');
  });
});
