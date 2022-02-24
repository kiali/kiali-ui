import { Given } from "cypress-cucumber-preprocessor/steps";

const url = 'https://google.com'
Given('user is logged in as administrator', () => {
  cy.visit(url)
})
