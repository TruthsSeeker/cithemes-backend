export interface IVoteRequest {
    user_id: string;
    entry_id: number;
    remove: boolean;
}

export interface ISearchRequest {
    query: string;
    city_id?: number;
}