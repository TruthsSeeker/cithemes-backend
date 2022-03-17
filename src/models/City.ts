import { knex } from '../db/knexfile'

export interface ICity {
    id?:number;
    name:string;
    country:string;
}

export class City {
    data: ICity

    constructor(city: ICity) {
        this.data = city;
    }

    static async find(id: number) {
        let result = await knex<ICity>('cities').first().where('id', id)

        if (!!result) {
            return new City(result)
        } else {
            throw new Error(`No corresponding entry found for ${id}`)
        } 
    }

    async create() {
        let exists = await knex<ICity>('cities').first().where(this.data)
        if (!exists) {
            this.data = await knex<ICity>('cities').insert(this.data)
        } else {
            throw new Error(`City already exists`)
        }
    }

    async update() {
        await knex<ICity>('cities').where('id', this.data.id).update(this.data)
    }

    async delete() {
        let id = this.data.id

        if (!!id) {
            await knex<ICity>('cities').where({ id: id }).delete()
        } else {
            throw new Error(`No id provided`)
        }
    }
}