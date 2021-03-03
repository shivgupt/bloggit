/* global Cypress, cy */

const my = {};

my.goHome = () => cy.get(`a#go-home`).click()
my.openDrawer = () => cy.get(`button#open-drawer`).click();
my.closeDrawer = () => cy.get(`div[role="presentation"]`).first().click(10, 10);
my.toggleAdminMode = () => cy.get(`label#toggle-admin-mode `).click();

my.authenticate = () => {
  cy.visit(`${Cypress.env("baseUrl")}/admin`);
  cy.get(`input#admin-token`).clear().type("abc123");
  cy.get("button#register-admin-token").click();
  cy.contains("div", /registered for admin access/i).should("exist")
  my.goHome();
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

my.publishPost = () => {
  cy.get(`div#fab > button`).click();
  cy.get(`button#fab-publish`).click();
};

my.createPost = (data) => {
  my.goHome();
  cy.get(`button#fab`).click();
  my.enterPostData(data);
  my.publishPost();
};

my.discard = () => {
  cy.get(`div#fab > button`).click();
  cy.get(`button#fab-discard`).click();
};

my.saveChanges = () => {
  cy.get(`div#fab > button`).click();
  cy.get(`button#fab-save`).click(10, 10);
};

my.editPost = (data) => {
  my.goHome();
  cy.get(`a[href="/${data.slug}"]`).click();
  cy.get(`button#fab`).dblclick(); // TODO: why do we need to dblclick here?
  my.enterPostData(data);
  my.saveChanges();
  my.goHome();
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
