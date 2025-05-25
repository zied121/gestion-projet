import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {DatePipe, NgIf} from '@angular/common';

@Component({
  selector: 'app-calendar-backoffice-detail',
  templateUrl: './calendar-backoffice-detail.component.html',
  imports: [
    MatDialogContent,
    MatDialogTitle,
    MatDialogActions,
    MatButton,
    MatDialogClose,

    DatePipe
  ],
  styleUrls: ['./calendar-backoffice-detail.component.css']
})
export class CalendarBackofficeDetailComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
