import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { RoomService } from '../../services/room.service';
import { MessageService } from '../../services/message.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class InboxComponent implements OnInit {

  rooms: any[] = [];
  selectedRoomId: string | null = null;
  selectedRoomName: string | null = null;
  
  @Output() roomSelected = new EventEmitter<string>();

  constructor(
    private roomService: RoomService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getUserRooms();

  }

  
  getUserRooms() {
    this.roomService.getRoomsByUser().subscribe({
      next: (res) => {
        this.rooms = res;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des rooms', err);
      }
    });
  }
/*
  selectRoom(roomId: string): void {
    this.selectedRoomId = roomId;
    const room = this.rooms.find(r => r._id === roomId);
    this.selectedRoomName = room ? room.name : 'Room';

    this.roomSelected.emit(roomId);
  }
  */
  selectRoom(roomId: string) {
    this.router.navigate(['/chat', roomId]);

  } 
  
}