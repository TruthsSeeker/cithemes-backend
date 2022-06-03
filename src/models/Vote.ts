import { knex } from '../db/knexfile'

export interface IVote {
    song_id: number;
    user_id: number;
    id?: number;
}

export class Vote {
    data: IVote

    constructor(vote: IVote) {
        this.data = vote;
    }

    static async find(id: number) {
        let result = await knex<IVote>('votes').first().where('id', id)
        
        if (!!result) {
            return new Vote(result)
        } else {
            throw new Error(`No corresponding entry found for ${id}`)
        } 
    }

    async create() {
        let exists = await knex<IVote>('votes').first().where({
            song_id: this.data.song_id,
            user_id: this.data.user_id,
        })
        if (!exists) {
            this.data = await knex<IVote>('votes').insert(this.data)
        } else {
            throw new Error(`Vote already exists`)
        }
    }

    async find() {
        let result = await knex<IVote>('votes').first().where({
            song_id: this.data.song_id,
            user_id: this.data.user_id,
        })
        if (!!result) {
            this.data = result
            return result
        } 
    }

    async delete() {
        let id = this.data.id

        if (!!id) {
            await knex<IVote>('votes').where({ id: id }).del()
        } else {
            throw new Error(`No id provided`)
        }
    }
}