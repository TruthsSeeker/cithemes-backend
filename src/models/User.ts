import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { knex } from "../db/knexfile";
import { emailRegex, passwordRegex } from "../utils/validators";

export interface IUser {
  email: string;
  password: string;
  id?: number;
}

export class User {
  data: IUser;

  constructor(user: IUser) {
    this.data = user;
  }

  static async getUser(id: number): Promise<User> {
    let user = await knex<IUser>("users").first().where("id", id);
    if (!user) {
      throw "User not found";
    }
    return new User(user);
  }

  async create() {
    if (!this._validate()) {
      throw "Invalid user data";
    }
    this.data.password = this._hashPassword(this.data.password);
    let exists = await knex<IUser>("users")
      .first()
      .where("email", this.data.email);
    if (!exists) {
      try {
        let result = await knex<IUser>("users")
          .insert(this.data)
          .returning("id");
        this.data.id = result.pop()?.id;
      } catch (err) {
        console.log(err);
      }
    } else {
      throw "User already exists";
    }
  }

  async save() {
    await knex<IUser>("users").update(this.data).where("id", this.data.id);
  }

  async update(email: string, password?: string, newPassword?: string) {
    if (newPassword && password) {
      if (!this._checkPassword(password, this.data.password))
        throw "Invalid password";
      this.data.password = newPassword;
      if (!this._validate()) throw "Invalid user data";
      this.data.password = this._hashPassword(newPassword);
    }
    this.data.email = email;
    await knex<IUser>("users").update(this.data).where("id", this.data.id);
  }

  async delete() {
    await knex<IUser>("users").delete().where("id", this.data.id);
    //TODO: Delete all user's tokens
  }

  async login() {
    if (!this._validate()) throw "Invalid login data";

    let user = await knex<IUser>("users")
      .first()
      .where("email", this.data!.email);
    if (!user) {
      throw "Incorrect email or password";
    }
    this.data.id = user.id;
    return this._checkPassword(this.data!.password!, user.password!);
  }

  private _validate(): boolean {
    return (
      emailRegex.test(this.data?.email ?? "") &&
      passwordRegex.test(this.data?.password ?? "")
    );
  }

  private _hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  private _checkPassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }
}
