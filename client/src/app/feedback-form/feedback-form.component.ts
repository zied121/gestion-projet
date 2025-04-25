import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FeedbackService } from '../services/feedback.service';
import { Feedback } from '../models/feedback.model';

@Component({
  selector: 'app-feedback-form',
  templateUrl: './feedback-form.component.html',
  styleUrls: ['./feedback-form.component.css']
})
export class FeedbackFormComponent {
  @Input() blogId: string = ''; // Identifiant du blog
  @Output() feedbackAdded = new EventEmitter<void>(); // 🔁 Notification parent

  feedback: Feedback = {
    content: '',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  isSubmitting = false;

  constructor(private feedbackService: FeedbackService) { }

  onSubmit(): void {
    if (!this.blogId || !this.feedback.content.trim()) {
      return;
    }

    this.isSubmitting = true;

    this.feedbackService.addFeedback(this.blogId, this.feedback).subscribe({
      next: () => {
        this.feedback.content = '';
        this.isSubmitting = false;
        this.feedbackAdded.emit(); // 🔔 Notification parent
      },
      error: (error) => {
        console.error("❌ Erreur lors de l'ajout du commentaire :", error);
        this.isSubmitting = false;
      }
    });
  }
}
