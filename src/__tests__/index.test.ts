import { beforeAdmin } from "./admin/before.admin";
import { testAuth } from "./auth";
import { beforeDriver } from "./driver/before";
import { userTest } from "./user/user";

describe("Sequential Test", () => {
    beforeAll(async () => {
        await beforeAdmin();
        await beforeDriver();
    }, 30000);

    testAuth();
    userTest();
});
