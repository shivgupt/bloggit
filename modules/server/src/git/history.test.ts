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
    const historyRes = await history(slug);
    expect(historyRes.length).to.equal(1);
    expect(historyRes[0].path).to.be.a("string");
    expect(historyRes[0].commit).to.be.a("string");
    expect(historyRes[0].timestamp).to.be.a("string");
  });

  it("should return a history entry if content is edited", async () => {
    const createRes = await edit([
      { path: "index.json", content: getIndex(slug) },
      { path: `${slug}.md`, content: "Test Content" },
    ]);
    let historyRes = await history(slug);
    expect(historyRes.length).to.equal(1);
    expect(historyRes[0].commit).to.equal(createRes.commit);
    const editRes = await edit([
      { path: `${slug}.md`, content: "Updated Content" },
    ]);
    historyRes = await history(slug);
    expect(historyRes.length).to.equal(2);
    expect(historyRes[0].commit).to.equal(editRes.commit);
    expect(historyRes[1].commit).to.equal(createRes.commit);
  });

  it("should not generate a history entry if a different file is edited", async () => {
    await edit([
      { path: "index.json", content: getIndex(slug) },
      { path: `${slug}.md`, content: "Test Content" },
    ]);
    expect((await history(slug)).length).to.equal(1);
    await edit([
      { path: `${slug}-different.md`, content: "Updated Content" },
    ]);
    expect((await history(slug)).length).to.equal(1);
  });

  it("should not generate a history entry if a draft is edited", async () => {
    // Create & edit a draft: no history entries generated
    await edit([
      { path: "index.json", content: getIndex(slug, true) },
      { path: `${slug}.md`, content: "Test Content" },
    ]);
    await edit([{ path: `${slug}.md`, content: "Different content" }]);
    const historyRes = await history(slug);
    expect(historyRes.length).to.equal(0);
    // Publish a draft: one history entry generated
    await edit([{ path: "index.json", content: getIndex(slug, false) }]);
    expect((await history(slug)).length).to.equal(1);
    // Unpublish a draft: no history entry generated
    await edit([{ path: "index.json", content: getIndex(slug, true) }]);
    expect((await history(slug)).length).to.equal(1);
    // Edit a draft: no history entry generated
    await edit([{ path: `${slug}.md`, content: "Updated content" }]);
    expect((await history(slug)).length).to.equal(1);
    await edit([{ path: `${slug}.md`, content: "Updated content again" }]);
    expect((await history(slug)).length).to.equal(1);
    // Re-publish a draft: one history entry generated for all updates
    await edit([{ path: "index.json", content: getIndex(slug, false) }]);
    expect((await history(slug)).length).to.equal(2);
  });

});

