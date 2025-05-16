import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-blog-form',
  templateUrl: './blog-form.component.html',
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
      const file = input.files[0];

      // Validate file type
      if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
        alert('Please select an image file (JPEG, JPG, PNG, GIF)');
        this.resetFileInput();
        return;
      }

      // Validate file size (e.g., 5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        this.resetFileInput();
        return;
      }

      this.selectedFile = file;

      // Create preview
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
    formData.append('title', this.feedbackForm.value.title);
    formData.append('content', this.feedbackForm.value.content);
    formData.append('categorie', this.feedbackForm.value.categorie._id);


    const tagsValue = this.feedbackForm.value.tags || '';
    if (tagsValue) {
      const tagsArray = tagsValue.split(',')
        .map((t: string) => t.trim())
        .filter((t: string) => t.length > 0);

      tagsArray.forEach((tag: string) => {
        formData.append('tags[]', tag);
      });

    }

    // Ajout de l'image si sélectionnée
    if (this.selectedFile) {
      formData.append('imageFile', this.selectedFile, this.selectedFile.name);
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
        this.isLoading = false;
        console.error('Error:', err);

        let errorMessage = 'Une erreur est survenue';

        if (err.error?.errors) {
          // Traitement des erreurs de validation
          const validationErrors = err.error.errors;
          errorMessage = validationErrors.map((e: any) => e.message).join('\n');
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.message) {
          errorMessage = err.message;
        }

        alert(errorMessage);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
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