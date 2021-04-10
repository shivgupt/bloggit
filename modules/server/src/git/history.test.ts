import { expect } from "../test-utils";

import { edit } from "./edit";
import { history } from "./history";

const getIndex = (slug: string, draft?: boolean): string => JSON.stringify({
  title: "Test Content",
  posts: {
    [slug]: {
      draft: !!draft,
      slug,
      title: "Test Title",
    },
  },
});

describe("git/history", () => {
  let slug;

  beforeEach(() => {
    slug = `test-slug-${Date.now()}`;
  });

  it("should throw if given an invalid request", async () => {
    await expect(history()).to.eventually.be.rejectedWith(/invalid/i);
  });

  it("should return a valid history response if given a valid request", async () => {
    await edit([
      { path: "index.json", content: getIndex(slug) },
      { path: `${slug}.md`, content: "Test Content" },
    ]);
    expect((await history(slug)).length === 1);
  });

  it("should return a history entry if content is edited", async () => {
    await edit([
      { path: "index.json", content: getIndex(slug) },
      { path: `${slug}.md`, content: "Test Content" },
    ]);
    expect((await history(slug)).length === 1);
    await edit([
      { path: `${slug}.md`, content: "Updated Content" },
    ]);
    expect((await history(slug)).length === 2);
  });

  it("should not return a history entry if a different file is edited", async () => {
    await edit([
      { path: "index.json", content: getIndex(slug) },
      { path: `${slug}.md`, content: "Test Content" },
    ]);
    expect((await history(slug)).length === 1);
    await edit([
      { path: `${slug}-different.md`, content: "Updated Content" },
    ]);
    expect((await history(slug)).length === 1);
  });

  it("should not return a history entry if a draft is edited", async () => {
    await edit([
      { path: "index.json", content: getIndex(slug, true) },
      { path: `${slug}.md`, content: "Test Content" },
    ]);
    expect((await history(slug)).length === 0);
    await edit([
      { path: "index.json", content: getIndex(slug, false) },
    ]);
    expect((await history(slug)).length === 1);
    await edit([
      { path: "index.json", content: getIndex(slug, true) },
      { path: `${slug}.md`, content: "Updated Content" },
    ]);
    expect((await history(slug)).length === 1);
    await edit([
      { path: "index.json", content: getIndex(slug, false) },
    ]);
    expect((await history(slug)).length === 2);
  });

});

