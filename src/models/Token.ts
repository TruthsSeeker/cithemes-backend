import jwt from 'jsonwebtoken'
import {v4 as uuid} from 'uuid'
import { knex } from '../db/database';
import { IUser, User } from './User';

export interface IToken {
    userId: string,
    email: string,
    token: string,
    parent?: string,
    jwtid: string
}

export default class Token {
    data?: IToken

    constructor(token?: IToken) {
        this.data = token
    }

    async create(userId: string, email: string) {
        let payload: IToken = {
            userId: userId,
            email: email,
            token: this.getAccessToken(userId),
            jwtid: uuid()
        }
        this.data = payload
        await this.save()
        
    }

    async save() {
        await knex.insert<IToken>(this.data).into('tokens')
    }

    // Returns `true` if token is valid, returns `false` after invalidating the token chain if token is invalid
    // Token is valid if it exists in the database and is not a parent token
    async check() {
        let exists = await knex<IToken>('tokens').first().where('jwtid', this.data?.jwtid)
        if (!exists) {
            return false
        }

        let isParent = await knex<IToken>('tokens').first().where('parent', this.data?.jwtid)
        if (!!isParent) {
            try {
                await this.invalidate()
                return false
            } catch(e) {
                throw e
            }
        }

        return true
    }

    // Throws if token hasn't successfully been invalidated
    // TODO
    async invalidate() {
        let family = await knex.withRecursive('ancestors', (qb)=> {
            qb.select().from('tokens').where('jwtid', this.data!.jwtid)
            .unionAll((uqb) => {
                uqb.select('tokens.*').from('ancestors').innerJoin('tokens', 'ancestors.jwtid', 'tokens.parent')
            })
        }).limit(4096).del().from('tokens').whereIn('jwtid', function(){
            this.select('jwtid').from('ancestors')
        })
    }

    async refreshToken() {
        if (await this.check() && !!this.data) {
            let payload: IToken = {
                parent: this.data.jwtid,
                email: this.data.email,
                userId: this.data.userId,
                token: this.getAccessToken(this.data.userId),
                jwtid: uuid()
            }
            this.data = payload
            await this.save()
            return this.getRefreshToken()
        } else {
            throw "Refresh token invalid"
        }
    }

    getRefreshToken() {
        if (!!this.data) {
            return jwt.sign(this.data, process.env.JWT_SECRET!, {expiresIn: '30d'})
        } else throw "No token data"
    }

    getAccessToken(uuid: string){
        // 1m expiry in dev env, 5 min otherwise
        let jwtExp = process.env.NODE_ENV === 'development' ? '10s' : '10m'
        let payload = {
            id: uuid
        }
        return jwt.sign(payload , process.env.JWT_SECRET!, {expiresIn: jwtExp})
    }

}