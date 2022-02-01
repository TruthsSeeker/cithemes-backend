// To parse this data:
//
//   import { Convert, GeocodingResult } from "./file";
//
//   const geocodingResult = Convert.toGeocodingResult(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface GeocodingResult {
    plusCode: PlusCode;
    results:  Result[];
    status:   string;
}

export interface PlusCode {
    compoundCode: string;
    globalCode:   string;
}

export interface Result {
    addressComponents: AddressComponent[];
    formattedAddress:  string;
    geometry:          Geometry;
    placeID:           string;
    plusCode?:         PlusCode;
    types:             string[];
}

export interface AddressComponent {
    longName:  string;
    shortName: string;
    types:     string[];
}

export interface Geometry {
    location:     Location;
    locationType: LocationType;
    viewport:     Bounds;
    bounds?:      Bounds;
}

export interface Bounds {
    northeast: Location;
    southwest: Location;
}

export interface Location {
    lat: number;
    lng: number;
}

export enum LocationType {
    Approximate = "APPROXIMATE",
    GeometricCenter = "GEOMETRIC_CENTER",
    Rooftop = "ROOFTOP",
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toGeocodingResult(json: string): GeocodingResult {
        return cast(JSON.parse(json), r("GeocodingResult"));
    }

    public static geocodingResultToJson(value: GeocodingResult): string {
        return JSON.stringify(uncast(value, r("GeocodingResult")), null, 2);
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
    "GeocodingResult": o([
        { json: "plus_code", js: "plusCode", typ: r("PlusCode") },
        { json: "results", js: "results", typ: a(r("Result")) },
        { json: "status", js: "status", typ: "" },
    ], false),
    "PlusCode": o([
        { json: "compound_code", js: "compoundCode", typ: "" },
        { json: "global_code", js: "globalCode", typ: "" },
    ], false),
    "Result": o([
        { json: "address_components", js: "addressComponents", typ: a(r("AddressComponent")) },
        { json: "formatted_address", js: "formattedAddress", typ: "" },
        { json: "geometry", js: "geometry", typ: r("Geometry") },
        { json: "place_id", js: "placeID", typ: "" },
        { json: "plus_code", js: "plusCode", typ: u(undefined, r("PlusCode")) },
        { json: "types", js: "types", typ: a("") },
    ], false),
    "AddressComponent": o([
        { json: "long_name", js: "longName", typ: "" },
        { json: "short_name", js: "shortName", typ: "" },
        { json: "types", js: "types", typ: a("") },
    ], false),
    "Geometry": o([
        { json: "location", js: "location", typ: r("Location") },
        { json: "location_type", js: "locationType", typ: r("LocationType") },
        { json: "viewport", js: "viewport", typ: r("Bounds") },
        { json: "bounds", js: "bounds", typ: u(undefined, r("Bounds")) },
    ], false),
    "Bounds": o([
        { json: "northeast", js: "northeast", typ: r("Location") },
        { json: "southwest", js: "southwest", typ: r("Location") },
    ], false),
    "Location": o([
        { json: "lat", js: "lat", typ: 3.14 },
        { json: "lng", js: "lng", typ: 3.14 },
    ], false),
    "LocationType": [
        "APPROXIMATE",
        "GEOMETRIC_CENTER",
        "ROOFTOP",
    ],
};
