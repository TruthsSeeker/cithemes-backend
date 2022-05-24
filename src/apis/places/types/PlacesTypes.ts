export interface FindPlaceResponse {
  candidates: Candidate[];
  status: string;
}

export interface Candidate {
  name: string;
  photos: Photo[];
  types: string[];
}

export interface Photo {
  height: number;
  html_attributions: string[];
  photo_reference: string;
  width: number;
}
