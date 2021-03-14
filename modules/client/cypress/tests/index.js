/* global Cypress, cy */

const my = require("../utils");

describe("Blog Client", () => {
  beforeEach(() => {
    my.authenticate();
  });

  it(`should reject an invalid admin token`, () => {
    cy.visit(`${Cypress.env("baseUrl")}/admin`);
    cy.get(`button#unregister-admin-token`).click();
    cy.get(`button#register-admin-token`).should("exist");
    cy.get(`input#admin-token`).clear().type("invalid");
    cy.get("button#register-admin-token").click();
    cy.get(`button#unregister-admin-token`).should("not.exist");
    cy.get(`label#toggle-admin-mode`).should("not.exist");
    cy.get(`button#fab`).should("not.exist");
  });

  it(`should create a new post`, () => {
    const data = {
      content: "This should create a post",
      title: "Create a Post",
      tldr: "test-create tldr",
      category: "test",
      slug: "test-create",
    };
    my.removePost(data.slug);
    cy.get(`button#fab`).click();
    my.enterPostData(data);
    my.savePost();
    cy.location(`pathname`).should(`eq`, `/${data.slug}`)
    cy.contains(`p`, data.content).should("exist");
    // cy.contains(`h2`, data.title).should("exist");
    my.goHome();
    cy.contains(`p`, data.tldr).should("exist");
    my.openDrawer();
    cy.contains(`div[role="button"]`, data.category).should("exist");
    my.closeDrawer();
    my.removePost(data.slug);
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
    my.removePost(slug);
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
    my.removePost(slug);
  });

  it(`should edit the index`, () => {
    const slug = "test-index-editor";
    my.removePost(slug);
    my.createPost({
      content: "This test will be used to test editing the index",
      title: "Index Editor",
      tldr: "index editor tldr",
      category: "test",
      slug
    });
    my.openDrawer();
    cy.get(`a#go-to-admin-page`).click();
    cy.get(`input#edit-index-title`).should("exist");
    cy.get(`button#edit-${slug}`).should("exist");
    cy.get(`input#toggle-featured-${slug}`).should("exist");
    cy.get(`input#toggle-draft-${slug}`).should("exist");
    cy.get(`input#toggle-remove-${slug}`).should("exist");
    // Edit the site title
    const oldTitle = "My Personal Blog"
    const newTitle = "My New Site Title"
    cy.get(`input#edit-index-title`).clear().type(newTitle);
    cy.get(`button#fab`).click();
    my.openDrawer();
    cy.contains(`div`, newTitle).should("exist");
    my.closeDrawer();
    cy.get(`input#edit-index-title`).clear().type(oldTitle);
    cy.get(`button#fab`).click();
    my.openDrawer();
    cy.contains(`div`, oldTitle).should("exist");
    my.closeDrawer();
    // Save a post as a draft
    cy.get(`input#toggle-draft-${slug}`).click();
    cy.get(`button#fab`).click();
    my.goHome();
    cy.get(`a[href="/${slug}"]`).should("not.exist");
    my.openDrawer();
    cy.get(`a#go-to-admin-page`).click();
    cy.get(`input#toggle-draft-${slug}`).click();
    cy.get(`button#fab`).click();
    my.goHome();
    cy.get(`a[href="/${slug}"]`).should("exist");
    my.removePost(slug); // Cleanup
  })

  it(`should browse post history`, () => {
    const slug = "test-history";
    const firstContent = "First content";
    const secondContent = "Second content";
    my.removePost(slug);
    my.createPost({
      content: firstContent,
      title: "Test History",
      tldr: "test history tldr",
      category: "test",
      slug
    });
    my.editPost({
      content: secondContent,
      title: "Test History Title II",
      tldr: "test2 history tldr",
      category: "test2",
      slug,
    });
    cy.visit(`${Cypress.env("baseUrl")}/${slug}`);
    cy.get(`button#open-history`).click();
    cy.get(`a#history-entry-1`).first().click();
    cy.location(`pathname`).should(`match`, /\/[a-f0-9]{8}\/[a-zA-Z0-0-]{1,}/)
    cy.get(`div#history-menu`).should("exist");
    cy.get(`a#jump-to-present`).should("exist");
    cy.contains(`p`, firstContent).should("exist");
    my.removePost(slug);
  });

  it(`should open a ToC that displays an outline of the current post's headings`, () => {
    const slug = "test-toc";
    const innerTitle = "Inner Title"
    const innerSubtitle = "Inner Subtitle"
    const innerTitleSlug = "inner-title"
    const innerSubtitleSlug = "inner-subtitle"
    my.removePost(slug);
    my.createPost({
      content: `# ${innerTitle}\n## ${innerSubtitle}\nKeep calm, this is the content for ${slug}`,
      title: `Title for ${slug}`,
      tldr: `tldr for ${slug}`,
      category: "test",
      slug
    });
    cy.visit(`${Cypress.env("baseUrl")}/${slug}`);
    my.openDrawer();
    cy.get(`a[href="/#${innerTitleSlug}"]`).should("exist");
    cy.get(`a[href="/#${innerSubtitleSlug}"]`).should("exist");
    my.closeDrawer();
    my.removePost(slug);
  });

});
