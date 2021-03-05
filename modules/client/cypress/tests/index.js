/* global Cypress, cy */

const my = require("../utils");

describe("Blog Client", () => {
  beforeEach(() => {
    my.authenticate();
  });

  it(`should reject an invalid admin token`, () => {
    cy.visit(`${Cypress.env("baseUrl")}/admin`);
    cy.contains("div", /NOT registered for admin access/i).should("exist");
    cy.get(`input#admin-token`).clear().type("invalid");
    cy.get("button#register-admin-token").click();
    cy.contains("div", /NOT registered for admin access/i).should("exist");
    my.openDrawer();
    cy.get(`label#toggle-admin-mode`).should("not.exist");
    my.closeDrawer();
    cy.get(`div#fab > button`).should("not.exist");
  });

  it(`should create a new post`, () => {
    const data = {
      content: "This should create a post",
      title: "Create a Post",
      tldr: "test-create tldr",
      category: "test",
      slug: "test-create",
    };
    cy.get(`button#fab`).click();
    my.enterPostData(data);
    my.publishPost();
    cy.location(`pathname`).should(`eq`, `/${data.slug}`)
    cy.contains(`p`, data.content).should("exist");
    // cy.contains(`h2`, data.title).should("exist");
    my.goHome();
    cy.contains(`p`, data.tldr).should("exist");
    my.openDrawer();
    cy.contains(`div[role="button"]`, data.category).should("exist");
    my.closeDrawer();
  });

  it(`should edit a post`, () => {
    const slug = "test-edit";
    const oldData = {
      content: "This should edit a post",
      title: "Edit a Post",
      tldr: "test-edit tldr",
      category: "test",
      slug
    };
    const newData = {
      content: "This should have edited a post",
      title: "Edited a Post",
      tldr: "test-edit tldr rount 2",
    };
    my.createPost(oldData);
    cy.get(`button#fab`).click();
    // Title errors
    cy.get(`input[name="title"]`).clear();
    cy.contains(`p`, /title is required/i).should("exist");
    cy.get(`input[name="title"]`).type(oldData.title);
    // Slug errors
    cy.get(`input[name="slug"]`).clear();
    cy.contains(`p`, /slug is required/i).should("exist");
    cy.get(`input[name="slug"]`).type(slug + "?? :)");
    cy.contains(`p`, /slug should only contain/i).should("exist");
    cy.get(`input[name="slug"]`).clear().type(slug);
    // Try discarding w/out any diff
    my.discard();
    cy.contains(`div#snackbar`, /no changes/i).should("not.exist");
    // Save & verify state afterwards
    cy.get(`button#fab`).click();
    my.enterPostData(newData);
    my.saveChanges()
    cy.contains(`p`, newData.content).should("exist");
    // cy.contains(`h2`, newData.title).should("exist");
    cy.get(`a[href="/"]`).click();
    cy.contains(`p`, newData.tldr).should("exist");
  });

  it(`should archive a post`, () => {
    const slug = "test-archive";
    my.createPost({
      content: "This test should archive a post",
      title: "Archive a Post",
      tldr: "test-archive tldr",
      category: "test",
      slug
    });
    my.archivePost(slug);
    my.goHome();
    cy.get(`a[href="${slug}"]`).should("not.exist");
  })


  it(`should browse post history`, () => {
    const slug = "test-history";
    const firstContent = "First content";
    const secondContent = "Second content";
    my.createPost({
      content: firstContent,
      title: "Test Title",
      tldr: "test tldr",
      category: "test",
      slug
    });
    my.editPost({
      content: secondContent,
      title: "Test Title II",
      tldr: "test2 tldr",
      category: "test2",
      slug,
    });
    cy.visit(`${Cypress.env("baseUrl")}/${slug}`);
    cy.contains(`button`, /history/i).click();
    cy.get(`ul > a`).first().click();
    cy.location(`pathname`).should(`match`, /\/[a-f0-9]{8}\/[a-zA-Z0-0-]{1,}/)
    cy.contains(`a`, /present/i).should("exist");
    cy.contains(`p`, firstContent).should("exist");
  });

  it(`should open a ToC that displays an outline of the current post's headings`, () => {
    const slug = "test-toc";
    const innerTitle = "Inner Title"
    const innerSubtitle = "Inner Subtitle"
    const innerTitleSlug = "inner-title"
    const innerSubtitleSlug = "inner-subtitle"
    my.createPost({
      content: `# ${innerTitle}\n## ${innerSubtitle}\nKeep calm, this is the content for ${slug}`,
      title: `Title for ${slug}`,
      tldr: `tldr for ${slug}`,
      category: "test",
      slug
    });
    cy.visit(`${Cypress.env("baseUrl")}/${slug}`);
    cy.get(`button[aria-label="open drawer"]`).click();
    cy.get(`a[href="/#${innerTitleSlug}"]`).should("exist");
    cy.get(`a[href="/#${innerSubtitleSlug}"]`).should("exist");
  });

});
