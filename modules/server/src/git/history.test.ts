import { expect } from "../test-utils";

import { history } from "./history";

describe("git/history", () => {
  it("should throw if given an invalid request", async () => {
    const invalidMsg = "Invalid slug";
    await expect(history()).to.eventually.be.rejectedWith(invalidMsg);
  });
});

