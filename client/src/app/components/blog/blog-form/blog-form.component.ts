import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BlogService } from '../../../services/blog.service';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-blog-form',
  templateUrl: './blog-form.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgForOf
  ],
  styleUrls: ['./blog-form.component.css']
})
export class BlogFormComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  feedbackForm!: FormGroup;
  imagePreview: string | null = null;
  selectedFile: File | null = null;
  isEditMode: boolean = false;
  blogId: string = '';
  categories = ['Technologie', 'Design', 'Business', 'Science'];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private blogService: BlogService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  private checkEditMode(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id && id !== 'undefined') {
        this.isEditMode = true;
        this.blogId = id;
        this.loadBlogForEdit(id);
      }
    });
  }

  private loadBlogForEdit(id: string): void {
    this.blogService.getBlogById(id).subscribe({
      next: (response) => {
        const blog = response.blog;
        this.feedbackForm.patchValue({
          title: blog.title,
          content: blog.content,
          category: blog.categorie,
          tags: blog.tags?.join(', ') || ''
        });
        this.imagePreview = blog.imageUrl || null;
      },
      error: (err) => {
        console.error('Error loading blog:', err);
        alert(`Failed to load blog: ${err.message}`);
        this.router.navigate(['/blogs']);
      }
    });
  }

  initForm(): void {
    this.feedbackForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      category: ['Technologie', Validators.required],
      tags: ['']
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input?.files[0];

      if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
        alert('Please select an image file (JPEG, JPG, PNG, GIF)');
        this.resetFileInput();
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        this.resetFileInput();
        return;
      }

      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  private resetFileInput(): void {
    this.fileInput.nativeElement.value = '';
    this.selectedFile = null;
    this.imagePreview = null;
  }

  removeImage(): void {
    this.resetFileInput();
  }

  onSubmit(): void {
    if (this.feedbackForm.invalid) {
      this.markFormGroupTouched(this.feedbackForm);
      alert('Veuillez remplir tous les champs obligatoires correctement');
      return;
    }

    if (!this.selectedFile && !this.isEditMode) {
      alert('Veuillez sélectionner une image');
      return;
    }

    this.isLoading = true;

    const formData = new FormData();

    // Ajout des champs avec vérification
    formData.append('title', this.feedbackForm.get('title')?.value || '');
    formData.append('content', this.feedbackForm.get('content')?.value || '');

    // Gestion de la catégorie
    const categoryValue = this.feedbackForm.get('category')?.value;
    if (!categoryValue) {
      alert('Veuillez sélectionner une catégorie');
      this.isLoading = false;
      return;
    }
    formData.append('categorie', categoryValue);

    // Gestion des tags
    const tagsValue = this.feedbackForm.get('tags')?.value;
    if (tagsValue) {
      const tagsArray = String(tagsValue).split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);
      tagsArray.forEach(tag => formData.append('tags', tag)); // Note: 'tags' au lieu de 'tags[]'
    }

    // Ajout de l'image
    if (this.selectedFile) {
      formData.append('image', this.selectedFile); // Note: 'image' au lieu de 'imageFile'
    }

    // Debug: Affichez le contenu de FormData
    formData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });

    const request = this.isEditMode
      ? this.blogService.updateBlog(this.blogId, formData)
      : this.blogService.createBlog(formData);

    request.subscribe({
      next: (res) => {
        alert(`Blog ${this.isEditMode ? 'mis à jour' : 'créé'} avec succès !`);
        this.router.navigate([this.isEditMode ? `/blogs/${this.blogId}` : '/blogs']);
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Erreur complète:', err);

        let errorMessage = 'Une erreur est survenue';

        if (err.error?.errors) {
          errorMessage = err.error.errors.map((e: any) => e.message).join('\n');
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.message) {
          errorMessage = err.message;
        }

        alert(errorMessage);
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(<FormGroup<any>>control);
      }
    });
  }

  resetForm(): void {
    this.feedbackForm.reset({
      category: 'Technologie',
      tags: ''
    });
    this.removeImage();
  }

  goBack(): void {
    if (this.isEditMode && this.blogId) {
      this.router.navigate(['/blogs', this.blogId]);
    } else {
      this.router.navigate(['/blogs']);
    }
  }
}
