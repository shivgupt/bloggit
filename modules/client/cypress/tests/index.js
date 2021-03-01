/* global Cypress, cy */

const my = {};

my.authenticate = () => {
  cy.visit(`${Cypress.env("baseUrl")}/admin`);
  cy.get(`input[type="text"]`).clear().type("abc123");
  cy.contains("button", /register/i).click();
  cy.contains("div", /registered for admin access/i).should("exist")
  cy.contains("button", /register/i).click();
  cy.get(`a[href="/"]`).click();
};

my.toggleAdmin = () => {
  cy.get(`button[aria-label="open drawer"]`).click();
  cy.get(`input[type="checkbox"]`).click();
  cy.get(`div[role="presentation"]`).click(10, 10);
};

my.editPost = (data) => {
  for (const key of ["category", "path", "slug", "tags", "title", "tldr"]) {
    if (typeof data[key] === "string") {
      cy.get(`input[name="${key}"]`).clear().type(data[key]);
    }
  }
  if (typeof data.content === "string") {
    cy.get(`textarea[data-testid="text-area"]`).clear().type(data.content);
  }
};

describe("Blog Client", () => {
  beforeEach(() => {
    cy.visit(Cypress.env("baseUrl"));
    my.authenticate();
  });

  it(`should create a new post`, () => {
    const content = "Keep calm, this is simply a test";
    const title = "Test Title";
    const slug = "test";
    const tldr = "test tldr";
    my.toggleAdmin();
    cy.get(`button#fab-create-new-post`).click();
    my.editPost({ title, category: "test", slug, tldr, content });
    cy.get(`div#fab-save-post > button`).click();
    cy.get(`button#sd-publish`).click();
    cy.contains(`p`, content).should("exist");
    cy.contains(`h2`, title).should("exist");
    cy.location(`pathname`).should(`eq`, `/${slug}`)
    cy.get(`a[href="/"]`).click();
    cy.contains(`p`, tldr).should("exist");
  });

});

