/* global Cypress, cy */

describe("Blog Client", () => {
  beforeEach(() => {
    cy.visit(Cypress.env("baseUrl"));
  });

  it(`should perform key actions without error`, () => {
    console.log("Alright ok");
  });

});

