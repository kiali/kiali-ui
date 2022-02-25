import { And, Given } from "cypress-cucumber-preprocessor/steps";
import { Then } from "cypress-cucumber-preprocessor/steps";

const url = "https://kiali-istio-system.apps.pmdown4.0216-eg3.fw.rhcloud.com"

Given('I open Kiali URL', () => {
  cy.visit(url)
})


Then(`I see {string} in the title`, (title) => {
  cy.title().should('include', title)
})


Then(`I see {string} button`, (title) => {
  cy.get('button[type=submit]').click()

})

//And(`I click`, (title) => {
//  cy.get('button[type=submit]').click()
//})

// <button class="pf-c-button pf-m-primary" type="submit" 