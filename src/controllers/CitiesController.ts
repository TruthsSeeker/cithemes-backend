import { PutObjectCommandInput } from "@aws-sdk/client-s3";
import { City, ICity } from "../models/City";
import { PlaylistEntry } from "../models/PlaylistEntry";
import { upload as uploadCDN } from "../apis/cdn/upload-cdn";
import * as fs from 'fs';
import axios, { AxiosResponse } from "axios";
import { Candidate, FindPlaceResponse } from "../apis/places/types/PlacesTypes";
import { ApiError } from "../utils/errors";
class CitiesController {
  async getPlaylist(id: number, userId: number | undefined) {
    if (!!userId) {
      return { result: await PlaylistEntry.findPlaylistWithUser(id, userId) };
    }
    return { result: await PlaylistEntry.findPlaylist(id) };
  }

  async findCityByName(query: string) {
    let results = await City.findByName(query);

    return await this.formatCities(results);
  }
  
  async nearestCities(lat: number, lng: number) {
    let result = await City.findNeareast(lat, lng);

    return await this.formatCities(result);
  }

  private async formatCities(result: ICity[]) {
    //Memoize distance ordering
    let hashedResult = [];
    for (let i = 0; i < result.length; i++) {
      let city = {
        cityId: result[i].id,
        id: i,
      };
      hashedResult.push(city);
    }

    let hasImages = result.filter((city) => !!city.image);
    let needsImages = result.filter((city) => !city.image);
    if (needsImages.length > 0) {
      needsImages = await this.getImages(needsImages);
    }
    let resultWithImages = hasImages.concat(needsImages);

    // Return results sorted by distance
    return hashedResult.map((hash) => {
      return resultWithImages.find((city) => city.id === hash.cityId);
    });
  }

  async getImages(cities: ICity[]) {

    let result: ICity[] = [];

    let places = await Promise.all(
      cities.map(async (city) => {
        return {
          cityId: city.id,
          candidate: await this.findPlace(city),
        };
      })
    );
    let headers = {
      Accept: "image/*",
    };
    let baseURL = "https://maps.googleapis.com/maps/api/place/photo";
    for (var place of places) {
      let reference = place.candidate.photos[0].photo_reference;
      let url =
        baseURL +
        "?maxwidth=800&photoreference=" +
        reference +
        "&key=" +
        process.env.GOOGLE_PLACES_API_KEY;
      let response: AxiosResponse<Buffer> = await axios.get(url, { headers: headers, responseType: "arraybuffer" });
      let image = response.data;
      let type = response.headers["content-type"].split("/")[1];
      let city = cities.find((c) => c.id === place.cityId);
      if (!city) {
        throw new ApiError("City not found");
      }
      let imageName = city.name_ascii.replace(/\s/g, "_") + "_" + city.iso2 + "." + type;


      let cdnUrl = await this.uploadImage(image, imageName, type);
      city.image = cdnUrl;
      let model = new City(city);
      await model.update();
      result.push(city);
    }
    return result;
  }
  
  async findPlace(city: ICity): Promise<Candidate> {
    let { x, y } = city.center;
    let cityCenter = "point:" + x + "," + y;
    let baseURL =
      "https://maps.googleapis.com/maps/api/place/findplacefromtext/json";
    let input = city.name;
    let inputtype = "textquery";
    let fields = ["photo", "name", "type"];
    let language = "en";
    let locationbias = cityCenter;

    let params = new URLSearchParams();
    params.append("input", input);
    params.append("inputtype", inputtype);
    params.append("fields", fields.join(","));
    params.append("language", language);
    params.append("locationbias", locationbias);
    params.append("key", process.env.GOOGLE_PLACES_API_KEY ?? "");

    let url = baseURL + "?" + params.toString();
    let response: AxiosResponse<FindPlaceResponse> = await axios.get(url);
    let candidates = response.data.candidates;
    let filtered = candidates.filter((c) => {
      return c.types.includes("locality");
    });
    if (filtered.length > 0) {
      return filtered[0];
    } else {
      throw new ApiError("No city found");
    }
  }

  async uploadImage(data: Buffer, name: string, format: string) {
    let params: PutObjectCommandInput = {
      Bucket: process.env.SPACE_BUCKET,
      Key: "city-images/" + name,
      Body: data,
      ACL: "public-read",
      ContentType: "image/" + format,
    }

    await uploadCDN(params);
    return process.env.CDN_URL + "city-images/" + name;
  }

  // async uploadImage() {
  //   console.log("Uploading image");
  //   let image = Buffer.from(fs.readFileSync("src/assets/LosAngeles.jpg"));
  //   console.log(image);
  //   let params: PutObjectCommandInput = {
  //     Bucket: process.env.SPACE_BUCKET,
  //     Key: "city-images/test.jpg",
  //     Body: image,
  //     ACL: "public-read",
  //     ContentType: "image/jpeg",
  //   };

  //   await uploadCDN(params);
  //   return { url: process.env.CDN_URL + "city-images/test.jpg" };
  // }

}

export = new CitiesController();
