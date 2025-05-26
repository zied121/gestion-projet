import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlogService } from '../../../services/blog.service';
import { FeedbackService } from '../../../services/feedback.service';
import { Blog, Comment, Author } from '../../../../../models/blog.model';
import { Subject, takeUntil } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Feedback } from '../../../../../models/feedback.model';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';


@Component({

  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  standalone: true,
  imports: [
    DatePipe,
    NgIf,
    NgForOf,
    FormsModule
  ],
  styleUrls: ['./blog-detail.component.css']
})
export class BlogDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // blog: Blog = {
  //   _id: '',
  //   title: '',
  //   content: '',
  //   author: { _id: '', username: '' },
  //   createdAt: new Date(),
  //   tags: [],
  //   comments: [],
  //   likeCount: 0,
  //   likes: []
  // };

  loading = true;
  loadingComments = false;
  newComment = '';
  feedbacks: Feedback[] = [];
  errorMessage: string | null = null;
  isLiking = false;
  isCommenting = false;
  shareInProgress = false;
  blog: Blog = {
    _id: '',
    title: '',
    content: '',
    author: { _id: '', username: '' },
    createdAt: new Date(),
    tags: [],
    comments: [],
    likeCount: 0,
    likes: []
  };

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private feedbackService: FeedbackService,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadBlogData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBlogData(): void {
    const blogId = this.route.snapshot.paramMap.get('id');
    if (!blogId) {
      this.errorMessage = 'ID de blog non trouvé';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    this.blogService.getBlogById(blogId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.blog = this.formatBlogData(response.blog);
          this.loadFeedbacks(blogId);
        },
        error: (err) => {
          console.error('Error loading blog:', err);
          this.handleError('Erreur lors du chargement du blog');
          this.loading = false;
        }
      });
  }

  private formatBlogData(blog: any): Blog {
    return {
      ...blog,
      tags: blog.tags || [],
      comments: blog.comments || [],
      likeCount: blog.likeCount || 0,
      likes: blog.likes || []
    };
  }

  loadFeedbacks(blogId: string): void {
    this.feedbackService.getFeedbacksByBlog(blogId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (feedbacks) => {
          this.feedbacks = feedbacks || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading feedbacks:', err);
          this.feedbacks = [];
          this.loading = false;
        }
      });
  }

  getAuthorName(author: any): string {
    return author?.username || 'Anonyme';
  }


likeBlog(): void {
  if (!this.blog._id || this.isLiking) return;

  this.isLiking = true;
  const previousLikeCount = this.blog.likeCount;

  // Optimistic update
  this.blog.likeCount += 1;

  this.blogService.likeBlog(this.blog._id)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        this.blog.likeCount = response.likeCount;
        this.blog.likes = response.likes || [];
        this.isLiking = false;
      },
      error: (err) => {
        console.error('Error liking blog:', err);
        this.blog.likeCount = previousLikeCount;
        this.isLiking = false;
      }
    });
}

  addComment(): void {
    if (!this.blog._id || !this.newComment.trim() || this.isCommenting) return;

    this.isCommenting = true;
    const commentContent = this.newComment;
    this.newComment = '';

    this.blogService.addComment(this.blog._id, commentContent)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (comment) => {
          this.blog.comments.unshift(comment);
          this.isCommenting = false;
        },
        error: (err) => {
          console.error('Error adding comment:', err);
          this.newComment = commentContent;
          this.isCommenting = false;
          this.showSnackbar("Une erreur s'est produite lors de l'ajout de votre commentaire");
        }
      });
  }

  onFeedbackCreated(newFeedback: Feedback): void {
    this.feedbacks.unshift(newFeedback);
  }

  async shareBlog(): Promise<void> {
    if (!this.blog || this.shareInProgress) return;

    this.shareInProgress = true;
    const shareData = {
      title: this.blog.title,
      text: this.blog.content.substring(0, 100) + '...',
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        this.copyShareLink();
      }
    } catch (err) {
      console.error('Erreur de partage:', err);
      this.copyShareLink();
    } finally {
      this.shareInProgress = false;
    }
  }

  private copyShareLink(): void {
    const success = this.clipboard.copy(window.location.href);
    if (success) {
      this.showSnackbar('Lien copié dans le presse-papiers !');
    } else {
      this.showSnackbar('Copiez le lien manuellement : ' + window.location.href);
    }
  }

  private showSnackbar(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['snackbar-custom']
    });
  }

  private handleError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = null, 5000);
  }
}
