describe('Mock server', () => {
  it('Runs forever and intercepts graph api calls', () => {
    cy.intercept('GET', '/kiali/api/namespaces/graph*', { fixture: 'large_graph.json' });
    cy.visit(Cypress.env().KIALI_URL);
    cy.pause();
  });
});
