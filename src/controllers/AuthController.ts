import { Request } from "express";
import { Hometown } from "../models/Hometown";
import Token, { IToken } from "../models/Token";
import {IUser, User} from '../models/User'
import { HometownError } from "../utils/errors";

class AuthController {
    async login(req: Request) {
        let {email, password} = req.body
        let user = new User({email: email, password:password})
        let passwordCorrect = await user.login()
        if (passwordCorrect) {
            let token = new Token()
            token.create(user.data!.id!, email)
            return {
                result: {
                    access_token: token.getAccessToken(), 
                    refresh_token: token.getRefreshToken()
                }
            }
        } else {
            throw "Invalid email or password"
        }
    }

    async signup(req: Request) {
        let {email, password} = req.body
        let user = new User()
        await user.create(email, password)
        let token = new Token()
        await token.create(user.data!.id!, email)
        // return {token: token.getRefreshToken()}
        return {
            result: {
                    access_token: token.getAccessToken(), 
                    refresh_token: token.getRefreshToken()
            }
        }
    }

    async refresh(req: Request) {
        let payload = req.payload as IToken
        let token = new Token(payload)
        return {
            result: await token.refreshToken()
        }
        
    }

    async logout(req: Request) {
        let payload = req.payload as IToken
        let token = new Token(payload)
        await token.invalidate()
        return {
            result: true
        }
    }

    async update(req: Request) {
        let payload = req.payload as IToken
        let {name, surname, email, password} = req.body
        // TODO: Refactor models to have an id constructor
        // let user = new User({id: payload.user_id})
        let user = await User.getUser(payload.user_id)
        await user.update()
        return {
            result: "OK"
        }
    }

    async setHometown(req: Request) {
        let payload = req.payload as IToken
        let {city_id} = req.body
        let hometown: Hometown

        let existing = await Hometown.findByUserId(payload.user_id)
        // let delay = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
        let delay = new Date(Date.now() - 1000 * 60)
        if (existing?.updated_at && existing.updated_at < delay) {
            throw new HometownError('Cannot change hometown too often')
        } else if (existing) {
            existing.updated_at = new Date()
            hometown = new Hometown(existing)
            await hometown.update()
        } else {
            hometown = new Hometown({city_id: city_id, user_id: payload.user_id})
            await hometown.create()
        } 
        return {
            result: {
                hometown: hometown.data.id
            }
        }
    }

}

export = new AuthController()