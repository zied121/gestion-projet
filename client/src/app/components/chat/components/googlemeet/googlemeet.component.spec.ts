
// meeting.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { GoogleMeetService, MeetResponse } from './google-meet.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.css']
})
export class MeetingComponent implements OnInit {
  @Input() roomId: string = '';
  
  isCreatingMeet = false;
  meetLink = '';
  error = '';
  isAuthenticated = false;
  authCheckComplete = false;

  constructor(
    private googleMeetService: GoogleMeetService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.checkAuthStatus();
    this.handleAuthCallback();
  }

  private handleAuthCallback() {
    // Check if user returned from Google OAuth
    this.route.queryParams.subscribe(params => {
      if (params['auth'] === 'success') {
        this.isAuthenticated = true;
        this.error = '';
        // Remove the auth parameter from URL
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        });
      } else if (params['auth'] === 'error') {
        this.error = 'Google authentication failed. Please try again.';
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        });
      }
    });
  }

  checkAuthStatus() {
    this.googleMeetService.checkAuthStatus().subscribe({
      next: (response) => {
        this.isAuthenticated = response.isAuthenticated;
        this.authCheckComplete = true;
      },
      error: (error) => {
        console.error('Error checking auth status:', error);
        this.isAuthenticated = false;
        this.authCheckComplete = true;
      }
    });
  }

  createMeeting() {
    if (!this.isAuthenticated) {
      this.redirectToGoogleAuth();
      return;
    }

    this.isCreatingMeet = true;
    this.error = '';
    this.meetLink = '';

    this.googleMeetService.createMeeting(this.roomId).subscribe({
      next: (response: MeetResponse) => {
        this.meetLink = response.meetLink;
        this.isCreatingMeet = false;
        
        // Open the meeting link in a new tab
        window.open(response.meetLink, '_blank');
      },
      error: (error) => {
        console.error('Error creating meeting:', error);
        this.isCreatingMeet = false;
        
        if (error.status === 401) {
          this.isAuthenticated = false;
          this.error = 'Authentication expired. Please authenticate again.';
        } else {
          this.error = error.error?.message || 'Failed to create meeting. Please try again.';
        }
      }
    });
  }

  private redirectToGoogleAuth() {
    window.location.href = 'http://localhost:5000/google/login';
  }

  revokeAuthentication() {
    this.googleMeetService.revokeAuth().subscribe({
      next: () => {
        this.isAuthenticated = false;
        this.meetLink = '';
        this.error = '';
      },
      error: (error) => {
        console.error('Error revoking auth:', error);
      }
    });
  }

  copyMeetLink() {
    if (this.meetLink) {
      navigator.clipboard.writeText(this.meetLink).then(() => {
        // You could show a toast notification here
        console.log('Meeting link copied to clipboard');
      });
    }
  }
}

// meeting.component.html
/*
<div class="meeting-container">
  <div class="meeting-controls" *ngIf="authCheckComplete">
    <!-- Authentication Status -->
    <div class="auth-status" *ngIf="!isAuthenticated">
      <p class="auth-message">
        <i class="fas fa-exclamation-triangle"></i>
        You need to authenticate with Google to create meetings.
      </p>
    </div>

    <!-- Create Meeting Button -->
    <button 
      class="create-meeting-btn"
      [disabled]="isCreatingMeet"
      (click)="createMeeting()"
      [class.authenticated]="isAuthenticated">
      <i class="fas fa-video" *ngIf="!isCreatingMeet"></i>
      <i class="fas fa-spinner fa-spin" *ngIf="isCreatingMeet"></i>
      {{ isCreatingMeet ? 'Creating Meeting...' : 'Start Google Meet' }}
    </button>

    <!-- Meeting Link Display -->
    <div class="meeting-link-container" *ngIf="meetLink">
      <div class="meeting-success">
        <i class="fas fa-check-circle"></i>
        <span>Meeting created successfully!</span>
      </div>
      <div class="meeting-link">
        <a [href]="meetLink" target="_blank" rel="noopener noreferrer">
          {{ meetLink }}
        </a>
        <button class="copy-btn" (click)="copyMeetLink()" title="Copy link">
          <i class="fas fa-copy"></i>
        </button>
      </div>
    </div>

    <!-- Error Display -->
    <div class="error-container" *ngIf="error">
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        {{ error }}
        <button class="retry-btn" (click)="createMeeting()" *ngIf="!isCreatingMeet">
          Try Again
        </button>
      </div>
    </div>

    <!-- Auth Controls -->
    <div class="auth-controls" *ngIf="isAuthenticated">
      <button class="revoke-btn" (click)="revokeAuthentication()">
        <i class="fas fa-sign-out-alt"></i>
        Disconnect Google Account
      </button>
    </div>
  </div>

  <!-- Loading State -->
  <div class="loading" *ngIf="!authCheckComplete">
    <i class="fas fa-spinner fa-spin"></i>
    Checking authentication status...
  </div>
</div>
*/
