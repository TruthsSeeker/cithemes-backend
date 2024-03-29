import { Request } from "express";
import { City } from "../models/City";
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
            await token.create(user.data!.id!, email)
            let hometown = await Hometown.findByUserId(user.data!.id!)
            return {
                result: {
                    access_token: token.getAccessToken(), 
                    refresh_token: token.getRefreshToken(),
                    hometown_id: hometown?.city_id
                }
            }
        } else {
            throw "Invalid email or password"
        }
    }

    async signup(req: Request) {
        let {email, password} = req.body
        let user = new User({email: email, password:password})
        await user.create()
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

    async logout(tokenData: IToken) {
        let token = new Token(tokenData)
        await token.invalidate()
        return {
            result: true
        }
    }

    async update(req: Request) {
        let {id: id, email, password, new_password} = req.body

        let user = await User.getUser(id)

        await user.update(email, password, new_password)
        return {
            result: "OK"
        }
    }

    async setHometown(req: Request) {
        let payload = req.payload as IToken
        let {city_id} = req.body
        let hometown: Hometown

        let existing = await Hometown.findByUserId(payload.user_id)
        let minTime = process.env.NODE_ENV == 'development' ? 1000 * 60 : 1000 * 60 * 60 * 24 * 30;
        let delay = new Date(Date.now() - minTime)
        if (existing?.updated_at && existing.updated_at > delay) {
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
                hometown: hometown.data.city_id
            }
        }
    }

    async getHometown(req: Request) {
        let hometown_id = parseInt(req.params.id)

        let hometown = await Hometown.findByCityId(hometown_id)
        let city = await City.findById(hometown_id)
        return {
            result: {
                hometown_id: hometown?.city_id,
                name: city.name,
                image: city.image,
                country: city.country,
                updated_at: hometown?.updated_at?.toISOString().replace(/(\.\d{3})/g, "")
            }
        }
    }

}

export = new AuthController()