import { expect } from "../test-utils";

import { edit } from "./edit";

describe("git/edit", () => {
  it("should throw if given an invalid request", async () => {
    const invalidMsg = "Invalid edit request";
    await expect(edit()).to.eventually.be.rejectedWith(invalidMsg);
    await expect(edit([])).to.eventually.be.rejectedWith(invalidMsg);
    await expect(edit([{ foo: "bar" }])).to.eventually.be.rejectedWith(invalidMsg);
    await expect(edit([{ path: "bar" }])).to.eventually.be.rejectedWith(invalidMsg);
    await expect(edit([{ content: "bar" }])).to.eventually.be.rejectedWith(invalidMsg);
    await expect(edit([{ path: "foo", content: 123 }])).to.eventually.be.rejectedWith(invalidMsg);
    await expect(edit([{ path: 123, content: "foo" }])).to.eventually.be.rejectedWith(invalidMsg);
  });
});
