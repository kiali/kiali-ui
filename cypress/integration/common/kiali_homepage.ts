import { Given } from "cypress-cucumber-preprocessor/steps";
import { Then } from "cypress-cucumber-preprocessor/steps";

const url = "https://kiali-istio-system.apps.pmdown4.0216-eg3.fw.rhcloud.com"

Given('I open Google page', () => {
  cy.visit(url)
})


Then(`I see {string} in the title`, (title) => {
  cy.title().should('include', title)
})