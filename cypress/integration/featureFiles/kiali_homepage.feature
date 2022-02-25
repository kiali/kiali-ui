Feature: Kilai login

  I want to login to Kiali and see landing page
  
  Scenario: Open Kaili home page
    Given I open Kiali URL
    Then I see "Kiali" in the title

  Scenario: Login intio kiali
    Given I open Kiali URL
    Then I see "Log In With OpenShift" button
    
