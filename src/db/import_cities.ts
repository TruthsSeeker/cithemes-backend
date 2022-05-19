import * as fs from 'fs';
import * as path from 'path';
import {parse} from 'csv-parse';
type City = {
  id: number;
  name: string;
  country: string;
  population: number;
  center: string,
  iso2: string,
  name_ascii: string,
  name_alt: string,
  capital: string,
}
export default function readCitiesCSV() {
  const filePath = path.join(__dirname, '../../../data/cities.csv');
  const file = fs.readFileSync(filePath, 'utf8');
  const headers = ['id','name','name_ascii','country','iso2','iso3','name_alt','capital','population','center'];

  parse(file, {
    delimiter: ',',
    columns: headers,
  }, (err, data: City[]) => {
    if (err) {
      console.error(err);
    }
    console.log(data);
  });

};