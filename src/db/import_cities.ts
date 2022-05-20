import * as fs from 'fs';
import * as path from 'path';
import {parse} from 'csv-parse';


export default async function readCitiesCSV(){
xconst filePath = path.join(__dirname, '../../data/cities.csv');
  const headers = ['id','name','name_ascii','country','iso2','iso3','name_alt','capital','population','center'];
  let cities: any[] = []

  const parser = fs.createReadStream(filePath)
  .pipe(
    parse({
      delimiter: ',',
      columns: headers,
    })
  )
  for await (const row of parser) {
    let city = {
      name: row.name,
      country: row.country,
      population: row.population,
      center: "point(" + row.center + ")",
      iso2: row.iso2,
      name_ascii: row.name_ascii,
      name_alt: row.name_alt,
      capital: row.capital,
    }
    cities.push(city);
  }
  return cities;
}

readCitiesCSV().then(cities => {
  console.log(cities);
})