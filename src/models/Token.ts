import jwt from 'jsonwebtoken'
import {v4 as uuid} from 'uuid'
import { knex } from '../db/knexfile';
import { AuthError } from '../utils/errors';

export interface IToken {
    user_id: number;
    email: string,
    parent?: string,
    jwtid: string
}

export default class Token {
    data?: IToken

    constructor(token?: IToken) {
        this.data = token
    }

    async create(userId: number, email: string) {
        let payload: IToken = {
            user_id: userId,
            email: email,
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
            await this.invalidate()
            return false

        }

        return true
    }

    // Throws if token hasn't successfully been invalidated
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
                user_id: this.data.user_id,
                jwtid: uuid()
            }
            this.data = payload
            await this.save()
            return {
                refresh_token: this.getRefreshToken(),
                access_token: this.getAccessToken()
            }
        } else {
            throw new AuthError('Invalid token')
        }
    }

    getRefreshToken() {
        if (!!this.data) {
            return jwt.sign(this.data, process.env.JWT_SECRET!, {expiresIn: '30d'})
        } else throw "No token data"
    }

    getAccessToken(){
        if (!!this.data) {
            let jwtExp = process.env.NODE_ENV === 'development' ? '300s' : '10m'
            let payload = {
                user_id: this.data.user_id
            }
            return jwt.sign(payload , process.env.JWT_SECRET!, {expiresIn: jwtExp})
        } else throw "No token data"
    }

}