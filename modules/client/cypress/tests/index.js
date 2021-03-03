/* global Cypress, cy */

const my = require("./utils");

describe("Blog Client", () => {
  beforeEach(() => {
    my.authenticate();
  });

  it(`should reject an invalid auth token`, () => {
    cy.visit(`${Cypress.env("baseUrl")}/admin`);
    cy.get(`input#auth-token`).clear().type("invalid");
    cy.get("button#register-auth-token").click();
    cy.contains("div", /NOT registered for admin access/i).should("exist")
    cy.get(`div#fab > button`).should("not.exist");
  });

  it(`should create, edit, and delete a new post`, () => {
    const slug = "test-edit";
    my.createPost({
      content: "Keep calm, this is only a test",
      title: "Test Title",
      tldr: "test tldr",
      category: "test",
      slug
    });
    const newTldr = "test2 tldr";
    my.editPost({
      content: "Keep calm, this is simply test number 2",
      title: "Test Title II",
      tldr: newTldr,
      category: "test2",
      slug,
    });
    my.archivePost(slug);
    cy.contains(`p`, newTldr).should("not.exist");
  });

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
