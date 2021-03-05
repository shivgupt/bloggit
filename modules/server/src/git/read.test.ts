import { expect } from "../test-utils";

import { getFile } from "./read";
import { edit } from "./edit";

describe("git read endpoint", () => {

  // Reset the index.json to a be valid & empty
  beforeEach(async () => {
    await edit([{
      path: "index.json",
      content: JSON.stringify({ title: "Test Blog", posts: [] }, null, 2),
    }]);
  });

  it("should throw if given an invalid request", async () => {
    await expect(getFile()).to.eventually.be.rejectedWith(/invalid/i);
    await expect(getFile("ref")).to.eventually.be.rejectedWith(/invalid/i);
  });

  it("should return the content at a valid filepath", async () => {
    await expect(getFile("main", "index.json")).to.eventually.be.ok;
  });
});
