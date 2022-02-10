// To parse this data:
//
//   import { Convert, SpotifyQuery } from "./file";
//
//   const spotifyQuery = Convert.toSpotifyQuery(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface SpotifyQuery {
    artists: Artists;
    tracks:  Tracks;
}

export interface Artists {
    href:     string;
    items:    ArtistsItem[];
    limit:    number;
    next:     null;
    offset:   number;
    previous: null;
    total:    number;
}

export interface ArtistsItem {
    externalUrls: ExternalUrls;
    followers:    Followers;
    genres:       any[];
    href:         string;
    id:           string;
    images:       Image[];
    name:         string;
    popularity:   number;
    type:         ArtistType;
    uri:          string;
}

export interface ExternalUrls {
    spotify: string;
}

export interface Followers {
    href:  null;
    total: number;
}

export interface Image {
    height: number;
    url:    string;
    width:  number;
}

export enum ArtistType {
    Artist = "artist",
}

export interface Tracks {
    href:     string;
    items:    TracksItem[];
    limit:    number;
    next:     string;
    offset:   number;
    previous: null;
    total:    number;
}

export interface TracksItem {
    album:            Album;
    artists:          Artist[];
    availableMarkets: string[];
    discNumber:       number;
    durationMS:       number;
    explicit:         boolean;
    externalIDS:      ExternalIDS;
    externalUrls:     ExternalUrls;
    href:             string;
    id:               string;
    isLocal:          boolean;
    name:             string;
    popularity:       number;
    previewURL:       null | string;
    trackNumber:      number;
    type:             PurpleType;
    uri:              string;
}

export interface Album {
    albumType:            AlbumTypeEnum;
    artists:              Artist[];
    availableMarkets:     string[];
    externalUrls:         ExternalUrls;
    href:                 string;
    id:                   string;
    images:               Image[];
    name:                 string;
    releaseDate:          string;
    releaseDatePrecision: ReleaseDatePrecision;
    totalTracks:          number;
    type:                 AlbumTypeEnum;
    uri:                  string;
}

export enum AlbumTypeEnum {
    Album = "album",
    Compilation = "compilation",
    Single = "single",
}

export interface Artist {
    externalUrls: ExternalUrls;
    href:         string;
    id:           string;
    name:         string;
    type:         ArtistType;
    uri:          string;
}

export enum ReleaseDatePrecision {
    Day = "day",
    Year = "year",
}

export interface ExternalIDS {
    isrc: string;
}

export enum PurpleType {
    Track = "track",
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toSpotifyQuery(json: string): SpotifyQuery {
        return cast(JSON.parse(json), r("SpotifyQuery"));
    }

    public static spotifyQueryToJson(value: SpotifyQuery): string {
        return JSON.stringify(uncast(value, r("SpotifyQuery")), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any = ''): never {
    if (key) {
        throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
    }
    throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`, );
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases, val);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue("array", val);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue("Date", val);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue("object", val);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, prop.key);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val);
    }
    if (typ === false) return invalidValue(typ, val);
    while (typeof typ === "object" && typ.ref !== undefined) {
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "SpotifyQuery": o([
        { json: "artists", js: "artists", typ: r("Artists") },
        { json: "tracks", js: "tracks", typ: r("Tracks") },
    ], false),
    "Artists": o([
        { json: "href", js: "href", typ: "" },
        { json: "items", js: "items", typ: a(r("ArtistsItem")) },
        { json: "limit", js: "limit", typ: 0 },
        { json: "next", js: "next", typ: null },
        { json: "offset", js: "offset", typ: 0 },
        { json: "previous", js: "previous", typ: null },
        { json: "total", js: "total", typ: 0 },
    ], false),
    "ArtistsItem": o([
        { json: "external_urls", js: "externalUrls", typ: r("ExternalUrls") },
        { json: "followers", js: "followers", typ: r("Followers") },
        { json: "genres", js: "genres", typ: a("any") },
        { json: "href", js: "href", typ: "" },
        { json: "id", js: "id", typ: "" },
        { json: "images", js: "images", typ: a(r("Image")) },
        { json: "name", js: "name", typ: "" },
        { json: "popularity", js: "popularity", typ: 0 },
        { json: "type", js: "type", typ: r("ArtistType") },
        { json: "uri", js: "uri", typ: "" },
    ], false),
    "ExternalUrls": o([
        { json: "spotify", js: "spotify", typ: "" },
    ], false),
    "Followers": o([
        { json: "href", js: "href", typ: null },
        { json: "total", js: "total", typ: 0 },
    ], false),
    "Image": o([
        { json: "height", js: "height", typ: 0 },
        { json: "url", js: "url", typ: "" },
        { json: "width", js: "width", typ: 0 },
    ], false),
    "Tracks": o([
        { json: "href", js: "href", typ: "" },
        { json: "items", js: "items", typ: a(r("TracksItem")) },
        { json: "limit", js: "limit", typ: 0 },
        { json: "next", js: "next", typ: "" },
        { json: "offset", js: "offset", typ: 0 },
        { json: "previous", js: "previous", typ: null },
        { json: "total", js: "total", typ: 0 },
    ], false),
    "TracksItem": o([
        { json: "album", js: "album", typ: r("Album") },
        { json: "artists", js: "artists", typ: a(r("Artist")) },
        { json: "available_markets", js: "availableMarkets", typ: a("") },
        { json: "disc_number", js: "discNumber", typ: 0 },
        { json: "duration_ms", js: "durationMS", typ: 0 },
        { json: "explicit", js: "explicit", typ: true },
        { json: "external_ids", js: "externalIDS", typ: r("ExternalIDS") },
        { json: "external_urls", js: "externalUrls", typ: r("ExternalUrls") },
        { json: "href", js: "href", typ: "" },
        { json: "id", js: "id", typ: "" },
        { json: "is_local", js: "isLocal", typ: true },
        { json: "name", js: "name", typ: "" },
        { json: "popularity", js: "popularity", typ: 0 },
        { json: "preview_url", js: "previewURL", typ: u(null, "") },
        { json: "track_number", js: "trackNumber", typ: 0 },
        { json: "type", js: "type", typ: r("PurpleType") },
        { json: "uri", js: "uri", typ: "" },
    ], false),
    "Album": o([
        { json: "album_type", js: "albumType", typ: r("AlbumTypeEnum") },
        { json: "artists", js: "artists", typ: a(r("Artist")) },
        { json: "available_markets", js: "availableMarkets", typ: a("") },
        { json: "external_urls", js: "externalUrls", typ: r("ExternalUrls") },
        { json: "href", js: "href", typ: "" },
        { json: "id", js: "id", typ: "" },
        { json: "images", js: "images", typ: a(r("Image")) },
        { json: "name", js: "name", typ: "" },
        { json: "release_date", js: "releaseDate", typ: "" },
        { json: "release_date_precision", js: "releaseDatePrecision", typ: r("ReleaseDatePrecision") },
        { json: "total_tracks", js: "totalTracks", typ: 0 },
        { json: "type", js: "type", typ: r("AlbumTypeEnum") },
        { json: "uri", js: "uri", typ: "" },
    ], false),
    "Artist": o([
        { json: "external_urls", js: "externalUrls", typ: r("ExternalUrls") },
        { json: "href", js: "href", typ: "" },
        { json: "id", js: "id", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "type", js: "type", typ: r("ArtistType") },
        { json: "uri", js: "uri", typ: "" },
    ], false),
    "ExternalIDS": o([
        { json: "isrc", js: "isrc", typ: "" },
    ], false),
    "ArtistType": [
        "artist",
    ],
    "AlbumTypeEnum": [
        "album",
        "compilation",
        "single",
    ],
    "ReleaseDatePrecision": [
        "day",
        "year",
    ],
    "PurpleType": [
        "track",
    ],
};
