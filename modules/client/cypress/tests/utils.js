/* global Cypress, cy */

const getUnformattedLine = (content) =>
  content.split(`\n`).find(line => line && !line.startsWith("#"));

const my = {};

my.authenticate = () => {
  cy.visit(`${Cypress.env("baseUrl")}/admin`);
  cy.get(`input#auth-token`).clear().type("abc123");
  cy.get("button#register-auth-token").click();
  cy.contains("div", /registered for admin access/i).should("exist")
  cy.get(`a[href="/"]`).click();
};

my.enterPostData = (data) => {
  for (const key of ["title", "category", "slug", "tldr"]) {
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

my.createPost = (data) => {
  cy.get(`button#fab`).click();
  my.enterPostData(data);
  cy.get(`div#fab > button`).click();
  cy.get(`button#fab-publish`).click();
  cy.contains(`p`, getUnformattedLine(data.content)).should("exist");
  cy.contains(`h2`, data.title).should("exist");
  cy.location(`pathname`).should(`eq`, `/${data.slug}`)
  cy.get(`a[href="/"]`).click();
  cy.contains(`p`, data.tldr).should("exist");
  cy.get(`button[aria-label="open drawer"]`).click();
  cy.contains(`div[role="button"]`, data.category).should("exist");
  cy.get(`div[role="presentation"]`).click(10, 10);
};

my.editPost = (data) => {
  cy.get(`a[href="/${data.slug}"]`).click();
  cy.get(`button#fab`).dblclick(); // TODO: why do we need to dblclick here?
  my.enterPostData(data);
  cy.get(`div#fab > button`).click();
  cy.get(`button#fab-save`).click();
  cy.contains(`p`, getUnformattedLine(data.content)).should("exist");
  cy.contains(`h2`, data.title).should("exist");
  cy.location(`pathname`).should(`eq`, `/${data.slug}`)
  cy.get(`a[href="/"]`).click();
  cy.contains(`p`, data.tldr).should("exist");
  cy.get(`button[aria-label="open drawer"]`).click();
  cy.contains(`div[role="button"]`, data.category).should("exist");
  cy.get(`div[role="presentation"]`).click(10, 10);
};

my.archivePost = (slug) => {
  cy.visit(`${Cypress.env("baseUrl")}/admin`);
  cy.contains(`span`, /posts/i).click();
  cy.contains(`a[href="/${slug}"] ~ div > button`, /archive/i).click();
  cy.contains(`span`, /posts/i).click();
  cy.contains(`span`, /drafts/i).click();
  cy.contains(`a[href="/${slug}"] ~ div > button`, /publish/i).should("exist");
  cy.visit(Cypress.env("baseUrl"));
};

module.exports = my
