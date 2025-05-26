import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BlogService } from '../../../services/blog.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';

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
      id: [''],
      title: ['', [Validators.required, Validators.minLength(5)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      category: ['Technologie', Validators.required],
      tags: [''],
      image: ['']
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

   const formData = new FormData();
   formData.append('title', this.feedbackForm.get('title')?.value || '');
   formData.append('content', this.feedbackForm.get('content')?.value || '');
   formData.append('categorie', this.feedbackForm.get('category')?.value || '');

   const tagsValue = this.feedbackForm.get('tags')?.value;
   if (tagsValue) {
     formData.append('tags', String(tagsValue)
       .split(',')
       .map(t => t.trim())
       .filter(t => t.length > 0)
       .join(','));
   }

   if (this.selectedFile) {
     formData.append('imageFile', this.selectedFile);
   }

   const request = this.isEditMode
     ? this.blogService.updateBlog(this.blogId, formData)
     : this.blogService.createBlog(formData);

   request.subscribe({
     next: (res) => {
       alert(`Blog ${this.isEditMode ? 'mis à jour' : 'créé'} avec succès !`);
       this.router.navigate([this.isEditMode ? `/blogs/${this.blogId}` : '/blogs']);
     },
     error: (err) => {
       console.error('Erreur complète:', err);
       alert('Une erreur est survenue');
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
