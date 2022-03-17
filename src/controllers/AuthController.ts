import { Request } from "express";
import Token, { IToken } from "../models/Token";
import {IUser, User} from '../models/User'

class AuthController {
    async login(req: Request) {
        let {email, password} = req.body
        let user = new User({email: email, password:password})
        let passwordCorrect = await user.login()
        if (passwordCorrect) {
            let token = new Token()
            token.create(user.data!.uuid!, email)
            return {token: token.getRefreshToken()}
        } else {
            throw "Invalid email or password"
        }
    }

    async signup(req: Request) {
        let {email, password} = req.body
        let user = new User()
        await user.create(email, password)
        let token = new Token()
        await token.create(user.data!.uuid!, email)
        return {token: token.getRefreshToken()}
    }

    async refresh(req: Request) {
        let payload = req.payload as IToken
        let token = new Token(payload)
        return await token.refreshToken()
        
    }

}

export = new AuthController()