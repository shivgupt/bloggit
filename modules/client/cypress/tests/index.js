/* global Cypress, cy */

describe("Blog Client", () => {
  beforeEach(() => {
    cy.visit(Cypress.env("publicUrl"));
  });

  it(`should perform key actions without error`, () => {
    console.log("Alright ok");
  });

});

