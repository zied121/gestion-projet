import { Component, EventEmitter, Output } from '@angular/core';
import { CloudinaryService } from '../../services/cloudinary.service';

// Déclaration pour le SDK Cloudinary
declare var cloudinary: any;

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.css']
})
export class ImageUploadComponent {
  @Output() imageUploaded = new EventEmitter<string>();
  
  imageUrl: string | null = null;
  uploadProgress = 0;
  errorMessage: string | null = null;
  isUploading = false;

  constructor(private cloudinaryService: CloudinaryService) {}

  // Nouvelle méthode pour ouvrir le widget Cloudinary
  openWidget() {
    this.resetState();
    
    cloudinary.openUploadWidget(
      {
        cloudName: 'dgk2f48s2', //  cloudName
        uploadPreset: 'angular_upload', // mon uploadPreset
        sources: ['local'],
        multiple: false,
        clientAllowedFormats: ['jpg', 'png', 'webp'],
        maxFileSize: 5000000, // 5MB
        cropping: false,
        theme: 'minimal'
      },
      (error: any, result: any) => {
        if (!error && result && result.event === 'success') {
          this.handleUploadSuccess(result.info);
        } else if (error) {
          this.handleUploadError(error);
        }
      }
    );
  }

  private handleUploadSuccess(info: any) {
    this.uploadProgress = 100;
    this.imageUrl = info.secure_url;
    this.imageUploaded.emit(info.secure_url);
    this.isUploading = false;
  }

  private handleUploadError(error: any) {
    this.errorMessage = 'Échec du téléversement. Veuillez réessayer.';
    console.error('Cloudinary upload error:', error);
    this.isUploading = false;
  }

  // Méthodes existantes conservées pour compatibilité
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    this.resetState();
    this.validateFile(file);
    
    if (!this.errorMessage) {
      this.uploadFile(file);
    }
  }

  clearImage() {
    this.imageUrl = null;
    this.errorMessage = null;
    this.imageUploaded.emit(undefined);
  }

  private resetState(): void {
    this.imageUrl = null;
    this.errorMessage = null;
    this.uploadProgress = 0;
    this.isUploading = true;
  }

  private validateFile(file: File): void {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      this.errorMessage = 'Seuls les formats JPG, PNG et WebP sont acceptés';
      this.isUploading = false;
    } else if (file.size > maxSize) {
      this.errorMessage = 'La taille maximale est de 5MB';
      this.isUploading = false;
    }
  }

  private uploadFile(file: File): void {
    this.cloudinaryService.uploadImage(file).subscribe({
      next: (res: any) => {
        this.handleUploadSuccess(res);
      },
      error: (err: any) => {
        this.handleUploadError(err);
      }
    });
  }
}