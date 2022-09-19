import { compareSync } from "bcrypt";
import { UserStore, User } from "../../models/user";

const store = new UserStore();

describe("Tests user model", () => {
  describe("tests create method", () => {
    it("checks if the create returns that is just created", async () => {
      const newUser: User = {
        firstName: "Yusuf",
        lastName: "Abdelaziz",
        password: "01004895720",
      };
      const returnedUser = await store.create(newUser);
      expect(returnedUser).toEqual(
        jasmine.objectContaining({
          id: 1,
          firstName: "Yusuf",
          lastName: "Abdelaziz",
        })
      );
      expect(compareSync(newUser.password!, returnedUser.password!)).toBeTrue();
    });
  });

  describe("tests index method", () => {
    it("checks if the index returns all users in the table", async () => {
      const users = await store.index();
      expect(users.length).toEqual(1);
      expect(users).toEqual([
        { id: 1, firstName: "Yusuf", lastName: "Abdelaziz" },
      ]);
    });
  });

  describe("tests authenticate method", () => {
    it("checks if the authenticate method returns the user created in the previous test", async () => {
      const user: User = {
        firstName: "Yusuf",
        lastName: "Abdelaziz",
        password: "01004895720",
      };
      const returnedUser = await store.authenticate(user);
      expect(returnedUser).toEqual(
        jasmine.objectContaining({
          id: 1,
          firstName: "Yusuf",
          lastName: "Abdelaziz",
        })
      );
    });
    it("checks if the authenticate method throws for non-existing user", async () => {
      const user: User = {
        firstName: "Jojo",
        lastName: "Abdelaziz",
        password: "01004895720",
      };
      try {
        const _ = await store.authenticate(user);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        const errorMsg = (e as Error).message;
        expect(errorMsg).toEqual("User is not found !");
      }
    });
    it("checks if the authenticate method returns null for existing user but with wrong password", async () => {
      const user: User = {
        firstName: "Yusuf",
        lastName: "Abdelaziz",
        password: "01104893856",
      };

      const returnedUser = await store.authenticate(user);
      expect(returnedUser).toBeNull();
    });
  });

  describe("tests show method", () => {
    it("checks if the show returns a single user given the id", async () => {
      const user = await store.show(1);
      expect(user).toEqual({
        id: 1,
        firstName: "Yusuf",
        lastName: "Abdelaziz",
      });
    });
  });

  describe("tests userExistById method", () => {
    it("checks if a user exist in the table given the id", async () => {
      const user1 = await store.userExistById(1);
      expect(user1).toBeTrue();
      const user2 = await store.userExistById(2);
      expect(user2).toBeFalse();
    });
  });
});
