import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io } from 'socket.io-client';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
})
export class RoomComponent implements AfterViewInit {
  private socket: any;
  roomId: string = '67fad9e1bfb6b540ae96665d';
  userId: string = '67f9c998f7bc43e2e1baa498'; // Temporary
  latestMessage: any = null;

  @ViewChild('messageInput') messageInput!: ElementRef;

  constructor(private http: HttpClient) {}

  ngAfterViewInit() {
    this.socket = io('http://localhost:5000');
    this.socket.emit('joinRoom', this.roomId);

    this.socket.on('receiveMessage', (message: any) => {
      this.latestMessage = message;
    });
  }

  sendMessage() {
    const messageText = this.messageInput.nativeElement.value;

    this.http.post('http://localhost:5000/api/messages/createMsg', {
      room: this.roomId,
      content: messageText,
      sender: this.userId
    }).subscribe();

    this.messageInput.nativeElement.value = '';
  }
}
