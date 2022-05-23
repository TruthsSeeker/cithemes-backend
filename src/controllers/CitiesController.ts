import { PutObjectCommandInput } from "@aws-sdk/client-s3";
import { City, ICity } from "../models/City";
import { PlaylistEntry } from "../models/PlaylistEntry";
import { upload as uploadCDN } from "../apis/cdn/upload-cdn";
import * as fs from 'fs';
class CitiesController {
  async getPlaylist(id: number, userId: number | undefined) {
    if (!!userId) {
      return { result: await PlaylistEntry.findPlaylistWithUser(id, userId) };
    }
    return { result: await PlaylistEntry.findPlaylist(id) };
  }

  async findCity(query: string) {}

  async getImages(cities: ICity[]): Promise<ICity[]> {
    return cities;
  }

  async uploadImage() {
    console.log("Uploading image");
    let image = Buffer.from(fs.readFileSync("src/assets/LosAngeles.jpg"));
    console.log(image)
    let params: PutObjectCommandInput = {
      Bucket: process.env.SPACE_BUCKET,
      Key: "city-images/test.jpg",
      Body: image,
      ACL: "public-read",
      ContentType: "image/jpeg",
    }

    await uploadCDN(params);
    return {"url": process.env.CDN_URL + "city-images/test.jpg"}
  }

  async nearestCities(lat: number, lng: number) {
    let result = await City.findNeareast(lat, lng);

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
}

export = new CitiesController();
