describe('Mock server', () => {
  it('Runs forever and intercepts graph api calls', () => {
    cy.intercept('GET', '/api/namespaces/graph*', { fixture: 'generated/generated_graph_data.json' });
    cy.visit(Cypress.env().KIALI_URL);
    cy.pause();
  });
});
