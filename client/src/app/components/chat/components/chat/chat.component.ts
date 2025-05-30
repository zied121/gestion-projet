import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomComponent } from '../room/room.component';
import { InboxComponent } from '../inbox/inbox.component';
import { Router, RouterOutlet } from '@angular/router';
@Component({
  imports: [CommonModule, InboxComponent, RouterOutlet],
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  standalone: true,
})
export class ChatComponent {
  selectedRoomId: string | null = "";

  onRoomSelected(roomId: string) {
    this.selectedRoomId = roomId;
  }
}