import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import { knex } from '../db/knexfile';
import { emailRegex, passwordRegex } from '../utils/validators';

export interface IUser {
    email: string;
    password: string;
    id?: number;
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
        }
        if (!this._validate()) {
            throw "Invalid user data"
        }
        this.data.password = this._hashPassword(this.data.password)
        let exists = await knex<IUser>('users').first().where('email', this.data.email)
        if (!exists) {
            try {
                let result = await knex<IUser>('users').insert(this.data).returning('id')
                this.data.id = result.pop()?.id
            } catch (err) {
                console.log(err)
            }
        } else {
            throw "User already exists"
        }
    }
    
    async save() {
        if (!!this.data) {
            await knex<IUser>('users').update(this.data).where('id', this.data.id)
            
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
        this.data.id = user.id
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