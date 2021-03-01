import { expect } from "../test-utils";

import { execPackService } from "./pack";

describe("git pack service", () => {
  it("should throw if given an invalid request", async () => {
    await expect(execPackService()).to.eventually.be.rejectedWith(/invalid/i);
  });
});


