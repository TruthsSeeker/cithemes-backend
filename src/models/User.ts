import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import { knex } from '../db/database';
import { emailRegex, passwordRegex } from '../utils/validators';

export interface IUser {
    email: string,
    password: string,
    uuid?: string,
}

export class User {
    data?:IUser

    constructor(user?: IUser){
        this.data = user
    }

    async create(email: string, password: string) {
        this.data = {
            email: email,
            password: password,
            uuid:  uuid()
        }
        if (!this._validate()) {
            throw "Invalid user data"
        }
        this.data.password = this._hashPassword(this.data.password)
        let exists = await knex<IUser>('users').first().where('email', this.data.email)
            if (!exists) {
                let success = await knex<IUser>('users').insert(this.data)
            } else {
                throw "User already exists"
            }
    }
    
    async save() {
        if (!!this.data) {
            await knex<IUser>('users').update(this.data).where('uuid', this.data.uuid)
            
        } else { 
            throw "No user data to save"
        }
 
    }

    async login() {
        if (!this.data || !this._validate()) throw "Invalid login data"
        
        let user = await knex<IUser>('users').first().where('email', this.data!.email)
        if (!user) {
            throw "Incorrect email or password"
        }
        this.data!.uuid = user.uuid
        return this._checkPassword(this.data!.password!, user.password!)
    }

    private _validate(): boolean {
        return emailRegex.test(this.data?.email ?? '') && passwordRegex.test(this.data?.password ?? '')
    }


    private _hashPassword(password: string): string {
        return bcrypt.hashSync(password, 10)
    }

    private _checkPassword(password: string, hash: string): boolean {
        return bcrypt.compareSync(password, hash)
    }
}