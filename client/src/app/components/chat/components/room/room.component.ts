import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef } from '@angular/core';
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
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
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
  isStartingCall = false;
  isGoogleAuthenticated = false;

  constructor(
    private messageService: MessageService,
    private socketService: SocketService,
    private route: ActivatedRoute,
    private roomService: RoomService

  ) {
    /*
    this.checkGoogleAuth();
    this.handleAuthRedirect();*/
  }
private handleAuthRedirect() {
  this.route.queryParams.subscribe(params => {
    if (params['googleAuthSuccess'] && this.room?._id) {
      // Only start call if we have a room ID
      this.isGoogleAuthenticated = true;
      this.startVideoCall();
    } else if (params['googleAuthError']) {
      alert('Google authentication failed. Please try again.');
    }
  });
}

signInWithGoogle() {
  if (this.room?._id) {
    this.roomService.initiateGoogleAuth(this.room._id);
  } else {
    this.roomService.initiateGoogleAuth();
  }
}
  checkGoogleAuth() {
    this.roomService.checkGoogleAuth().subscribe({
      next: (response) => {
        this.isGoogleAuthenticated = response.authenticated;
      },
      error: () => {
        this.isGoogleAuthenticated = false;
      }
    });
  }
async startVideoCall() {
   if (!this.room?._id) return;
  
  try {
    // Type is now guaranteed to be AuthCheckResponse
    const authCheck = await this.roomService.checkGoogleAuth().toPromise();
    
    // No need for undefined check since we have the interface

    if (!this.isGoogleAuthenticated) {
      this.signInWithGoogle();
      return;
    }
    this.isStartingCall = true;
    const response = await this.roomService.startCall(this.room._id).toPromise();
    
    if (response?.meetLink) {
      this.messageText = `Video call started: ${response.meetLink}`;
      this.sendMessage();
      setTimeout(() => {
        window.open(response.meetLink, '_blank', 'noopener,noreferrer');
      }, 300);
    }
  } catch (error) {
    // Error handling remains the same
  } finally {
    this.isStartingCall = false;
  }
}

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
  /*sendMessage(): void {
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
  }*/
sendMessage(): void {
    const formData = new FormData();
    formData.append('room', this.currentRoomId);
    formData.append('content', this.messageText);

    if (this.selectedFile) {
      formData.append('file', this.selectedFile, this.selectedFile.name);
    }

    this.messageService.sendMessage(formData).subscribe((newMessage) => {
      this.socketService.emit('sendMessage', newMessage);

      // Réinitialiser les champs du formulaire
      this.messageText = '';
      this.selectedFile = null;
      
      // Réinitialiser le champ de fichier dans le DOM
      if (this.fileInput && this.fileInput.nativeElement) {
        this.fileInput.nativeElement.value = '';
      }
    });
  }
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
}/*
signInWithGoogle() {
  this.roomService.initiateGoogleAuth();
}*/
}
