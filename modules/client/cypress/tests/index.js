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
      if (data[key].length > 0) {
        cy.get(`input[name="${key}"]`).clear().type(data[key]);
      } else {
        cy.get(`input[name="${key}"]`).clear();
      }
    }
  }
  if (typeof data.content === "string") {
    if (data.content.length > 0) {
      cy.get(`textarea[data-testid="text-area"]`).clear().type(data.content);
    } else {
      cy.get(`textarea[data-testid="text-area"]`).clear();
    }
  }
};

describe("Blog Client", () => {
  beforeEach(() => {
    cy.visit(Cypress.env("baseUrl"));
    my.authenticate();
    my.toggleAdmin();
  });

  it(`should create, edit, and delete a new post`, () => {
    const slug = "test";

    // Create a new post
    let content = "Keep calm, this is only a test";
    let title = "Test Title";
    let tldr = "test tldr";
    let category = "test";
    cy.get(`button#fab`).click();
    my.editPost({ title, category, slug, tldr, content });
    cy.get(`div#fab > button`).click();
    cy.get(`button#fab-publish`).click();
    cy.contains(`p`, content).should("exist");
    cy.contains(`h2`, title).should("exist");
    cy.location(`pathname`).should(`eq`, `/${slug}`)
    cy.get(`a[href="/"]`).click();
    cy.contains(`p`, tldr).should("exist");
    cy.get(`button[aria-label="open drawer"]`).click();
    cy.contains(`div[role="button"]`, category).should("exist");
    cy.get(`div[role="presentation"]`).click(10, 10);

    // Edit the post
    content = "Keep calm, this is simply test number 2";
    title = "Test Title II";
    tldr = "test2 tldr";
    category = "test2";
    cy.get(`a[href="/${slug}"]`).click();
    cy.get(`button#fab`).dblclick(); // TODO: why do we need to dblclick here?
    my.editPost({ title, category, slug, tldr, content });
    cy.get(`div#fab > button`).click();
    cy.get(`button#fab-save`).click();
    cy.contains(`p`, content).should("exist");
    cy.contains(`h2`, title).should("exist");
    cy.location(`pathname`).should(`eq`, `/${slug}`)
    cy.get(`a[href="/"]`).click();
    cy.contains(`p`, tldr).should("exist");
    cy.get(`button[aria-label="open drawer"]`).click();
    cy.contains(`div[role="button"]`, category).should("exist");
    cy.get(`div[role="presentation"]`).click(10, 10);

    // Archive the post
    cy.visit(`${Cypress.env("baseUrl")}/admin`);
    cy.contains(`span`, /posts/i).click();
    cy.contains(`a[href="/${slug}"] ~ div > button`, /archive/i).click();
    cy.contains(`span`, /posts/i).click();
    cy.contains(`span`, /drafts/i).click();
    cy.contains(`a[href="/${slug}"] ~ div > button`, /publish/i).should("exist");
    cy.visit(Cypress.env("baseUrl"));
    cy.contains(`p`, tldr).should("not.exist");

  });

});

