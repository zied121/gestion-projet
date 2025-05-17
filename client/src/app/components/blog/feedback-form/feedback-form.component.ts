import { Component, EventEmitter, Input, Output } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { FeedbackService } from '../../../services/feedback.service';
import { Feedback } from '../../../../../models/feedback.model';
import {NgClass, NgForOf, NgIf} from '@angular/common';



@Component({
  selector: 'app-feedback-form',
  templateUrl: './feedback-form.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass,
    NgIf,
    NgForOf
  ],
  styleUrls: ['./feedback-form.component.css']
})
export class FeedbackFormComponent {
  @Input() blogId!: string;
  @Input() isEditMode: boolean = false;
  @Output() feedbackSubmitted = new EventEmitter<Feedback>();

  feedbackForm: FormGroup;
  categories: string[] = ['Général', 'Technique', 'Suggestion', 'Bug'];

  constructor(private fb: FormBuilder, private feedbackService: FeedbackService) {
    this.feedbackForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      category: ['Général', Validators.required],
      tags: ['']
    });
  }

  ngOnInit(): void {
    if (this.isEditMode) {
      // Charger les données existantes si en mode édition
      this.loadFeedbackData();
    }
  }

  loadFeedbackData(): void {
    // Implémentez la logique de chargement si nécessaire
    this.feedbackForm.patchValue({
      title: 'Titre existant',
      content: 'Contenu existant...',
      category: 'Technique',
      tags: 'feedback,amélioration'
    });
  }

  onSubmit(): void {
    if (this.feedbackForm.invalid) {
      this.markFormAsTouched();
      return;
    }

    const feedbackData: Feedback = {
      ...this.feedbackForm.value,
      blog: this.blogId,
      createdAt: new Date(),
      user: { username: 'Current User' } // À remplacer par l'utilisateur réel
    };

    this.feedbackSubmitted.emit(feedbackData);
    this.resetForm();
  }

  private markFormAsTouched(): void {
    Object.values(this.feedbackForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  public resetForm(): void {
    this.feedbackForm.reset({
      category: 'Général'
    });
  }


}
