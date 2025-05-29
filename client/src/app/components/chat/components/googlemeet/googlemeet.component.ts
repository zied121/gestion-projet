
// meeting.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { GoogleMeetService, MeetResponse } from '../../services/googleservice.service'; ;
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
    window.location.href = 'http://localhost:5000/api/google/login';
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
  
  checkAuthStatus() {
    this.googleMeetService.checkAuthStatus().subscribe({
      next: (response) => {
        this.isAuthenticated = response.isAuthenticated;
      },
      error: (error) => {
        console.error('Error checking auth status:', error);
        this.isAuthenticated = false;
      }
    });
  }

  handleAuthCallback() {
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
      }
    });
  }

  startVideoCall() {
    if (!this.isAuthenticated) {
      window.location.href = 'http://localhost:5000/google/login';
      return;
    }

    this.isCreatingMeet = true;
    this.error = '';

    this.googleMeetService.createMeeting(this.roomId).subscribe({
      next: (response) => {
        this.meetLink = response.meetLink;
        this.isCreatingMeet = false;
        
        // Open the meeting link in a new tab
        window.open(response.meetLink, '_blank');
        
        // Optionally show success message
        alert('Meeting created! Opening in new tab...');
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
}