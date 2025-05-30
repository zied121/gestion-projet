import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../services/message.service';
import { Message } from '../../services/message.service';
//import { SocketService } from '../../../services/socket.service';  // Import du service WebSocket
import { SocketService } from '../../services/socket.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Room, RoomService } from '../../services/room.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class RoomComponent implements OnInit, OnDestroy {
  @Input() roomId!: string;

  currentRoomId: string = '';
  messages: Message[] = [];
  room: Room | null = null;
  messageText: string = '';
  selectedFile: File | null = null;
  currentUserId: string = '';
  rooms: any[] = [];
  private roomSubscription!: Subscription;

  editingMessageId: string | null = null;
  editedContent: string = '';

  constructor(
    private messageService: MessageService,
    private socketService: SocketService,
    private route: ActivatedRoute,
    private roomService: RoomService

  ) {}

  ngOnInit(): void {

    const userId = localStorage.getItem('userId');
    this.currentUserId = userId ? userId : '';
    console.log("currentUserId", this.currentUserId);
    this.route.paramMap.subscribe(params => {
      this.currentRoomId = params.get('id')!;
      this.messages = [];
      this.socketService.joinRoom(this.currentRoomId);
      this.roomService.getRoomById(this.currentRoomId).subscribe(room => {
        this.room = room;
        console.log("aaaaa",this.room);
      });
      this.messageService.getMessagesByRoom(this.currentRoomId).subscribe((msgs) => {
        this.messages = msgs;
        console.log(this.messages);
      });

      // Souscrire aux nouveaux messages depuis WebSocket
      this.socketService.listen('receiveMessage').subscribe((newMessage: Message) => {
       if (!this.messages.some(m => m._id === newMessage._id)) {
        this.messages.push(newMessage);
      }
      });
      //update message
      this.socketService.listen('messageUpdated').subscribe((updated: Message) => {
        const index = this.messages.findIndex(m => m._id === updated._id);
        if (index !== -1) {
          this.messages[index] = updated;
          this.messages = [...this.messages];
        }
});
   this.roomSubscription = this.socketService.listenForNewRoom().subscribe((newRoom) => {
      console.log('New room created:', newRoom);
      this.rooms.push(newRoom);  // Add the new room to the list
    });
        // Écouter les messages supprimés via WebSocket
        this.socketService.listen('messageDeleted').subscribe((deletedMessageId: string) => {
          this.messages = this.messages.filter(m => m._id !== deletedMessageId); // Supprimer le message de la liste
        });
    });
  }

  ngOnDestroy(): void {
    // Désinscrire du WebSocket lorsque le composant est détruit
    this.socketService.stopListening('receiveMessage');
    this.socketService.stopListening('messageUpdated');
    this.socketService.stopListening('messageDeleted');
  }

  // Méthode pour envoyer un message
  sendMessage(): void {
    const formData = new FormData();
    formData.append('room', this.currentRoomId); // Append the room ID
    formData.append('content', this.messageText); // Append the message content

    if (this.selectedFile) {
      formData.append('file', this.selectedFile, this.selectedFile.name);
    }

    // Call the service to send the message with FormData
    this.messageService.sendMessage(formData).subscribe((newMessage) => {
      // Add the new message to the list of messages
      //this.messages.push(newMessage);

      // Emit the new message to WebSocket for real-time updates
      this.socketService.emit('sendMessage', newMessage);

      // Reset the form fields
      this.messageText = '';
      this.selectedFile = null;
    });
  }

  // Gérer la sélection du fichier
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }
  startEditing(messageId: string, currentContent: string): void {
    this.editingMessageId = messageId;
    this.editedContent = currentContent;
  }

 /* updateMessage(): void {
    if (!this.editingMessageId) return;

    this.messageService.updateMessage(this.editingMessageId, { content: this.editedContent })
      .subscribe(updated => {
        const index = this.messages.findIndex(m => m._id === updated._id);
        if (index !== -1) {
          this.messages[index] = updated;
          this.messages = [...this.messages];
        }
        this.socketService.emit('updateMessage', updated);
        this.editingMessageId = null;
        this.editedContent = '';
      });
  }*/
  updateMessage(): void {
  if (!this.editingMessageId) return;

  // Appel à la méthode de mise à jour du message via le service
  this.messageService.updateMessage(this.editingMessageId, { content: this.editedContent })
    .subscribe({
      next: (updated) => {
        const index = this.messages.findIndex(m => m._id === updated._id);
        if (index !== -1) {
          // Mettre à jour le message dans le tableau
          this.messages[index] = updated;
          // Forcer la mise à jour de la vue
          this.messages = [...this.messages];
        }
        this.socketService.emit('updateMessage', updated);

        this.editingMessageId = null;
        this.editedContent = '';
      },
      error: (err) => {
        console.error("Erreur lors de la mise à jour du message:", err);
      }
    });
}

deleteMessage(messageId: string): void {
  this.messageService.deleteMessage(messageId).subscribe(() => {

  });
}
toggleLike(messageId: string): void {
  this.messageService.toggleLike(messageId).subscribe((updatedMsg) => {
    const index = this.messages.findIndex(m => m._id === updatedMsg._id);
    if (index !== -1) {
      this.messages[index] = updatedMsg;
      this.messages = [...this.messages];
    }
    this.socketService.emit('updateMessage', updatedMsg);
  });
}
pinMessage(messageId: string): void {
  this.messageService.pinMessage(messageId).subscribe((updatedMsg) => {
    const index = this.messages.findIndex(m => m._id === updatedMsg._id);
    if (index !== -1) {
      this.messages[index] = updatedMsg;
      this.messages = [...this.messages];
    }
    this.socketService.emit('updateMessage', updatedMsg);  // si besoin
  });
}

ngOnChanges() {
  if (this.roomId) {
    this.messageService.getMessagesByRoom(this.roomId).subscribe();
  }}

loadMessages(roomId: string) {
  this.messages = []; // ✅ Clear first
  this.messageService.getMessagesByRoom(roomId).subscribe({
    next: (res) => {
      this.messages = res;
    },
    error: (err) => {
      console.error('Error loading messages:', err);
    }
  });
}
  /*
loadMessages(roomId: string) {
  this.messages = [];  // Clear old messages immediately
  this.messageService.getMessagesByRoom(roomId).subscribe({
    next: (res) => {
      this.messages = res;
    },
    error: (err) => {
      console.error('Error loading messages:', err);
    }
  });
}
*/
getUserColor(username: string): string {
  if (!username) return '#cccccc'; // Default gray for unknown users
  
  // Simple hash function to convert name to color
  const colors = [
    '#FFB6C1', '#FFD700', '#98FB98', '#87CEFA', 
    '#FFA07A', '#9370DB', '#20B2AA', '#F08080'
  ];
  
  const hash = username.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
}
}
