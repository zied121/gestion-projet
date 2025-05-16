import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CLOUD_NAME } from '../cloudinary.config'; 

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private readonly uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  private uploadPreset = 'angular_upload'; 

  constructor(private http: HttpClient) {}

  uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    return this.http.post<{ secure_url: string }>(this.uploadUrl, formData);
  }
}