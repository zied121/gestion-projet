import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FeedbackService } from '../../../services/feedback.service';
import { NgClass, NgForOf, NgIf } from '@angular/common';

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
  feedbackForm: FormGroup;
  categories: string[] = ['Général', 'Technique', 'Suggestion', 'Bug'];
  feedbackTypes = [
    { id: 'comment', label: 'Commentaire', icon: '💬' },
    { id: 'bug', label: 'Rapport de bug', icon: '🐛' },
    { id: 'suggestion', label: 'Suggestion', icon: '💡' }
  ];

  constructor(private fb: FormBuilder, private feedbackService: FeedbackService) {
    this.feedbackForm = this.fb.group({
      type: ['comment', Validators.required],
      title: ['', [Validators.required, Validators.minLength(5)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      category: ['Général', Validators.required],
      email: ['', [Validators.email]], // Champ optionnel
      notifyMe: [false] // Case à cocher
    });
  }

  onSubmit(): void {
    if (this.feedbackForm.invalid) {
      this.markFormAsTouched();
      return;
    }

    const feedbackData = {
      ...this.feedbackForm.value,
      createdAt: new Date(),
      // Ajoutez ici d'autres métadonnées si nécessaire
    };

    this.feedbackService.submitFeedback(feedbackData).subscribe({
      next: () => {
        alert('Merci pour votre feedback !');
        this.resetForm();
      },
      error: (err) => {
        console.error('Erreur:', err);
        alert('Une erreur est survenue. Veuillez réessayer.');
      }
    });
  }

  private markFormAsTouched(): void {
    Object.values(this.feedbackForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  public resetForm(): void {
    this.feedbackForm.reset({
      type: 'comment',
      category: 'Général',
      notifyMe: false
    });
  }
}