import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef , ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../services/message.service';
import { Message } from '../../services/message.service';
//import { SocketService } from '../../../services/socket.service';  // Import du service WebSocket
import { SocketService } from '../../services/socket.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import {  RoomService } from '../../services/room.service';
import { Room } from '../../../../../../models/room.model'; // Import du modèle Room
import { GoogleMeetService } from '../../services/googleservice.service';

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
  showPinnedModal: boolean = false;
  private roomSubscription!: Subscription;

  editingMessageId: string | null = null;
  editedContent: string = '';
  isStartingCall = false;
  isGoogleAuthenticated = false;

  constructor(
    private messageService: MessageService,
    private socketService: SocketService,
    private route: ActivatedRoute,
    private roomService: RoomService,
    private googleMeetService: GoogleMeetService

  ) {
    /*
    this.checkGoogleAuth();
    this.handleAuthRedirect();*/
  }
connectGoogleCalendar() {
  this.googleMeetService.loginWithGoogle().subscribe({
    next: () => {}, // Redirect happens in the service
    error: err => {
      console.error('Google login failed:', err);
    }
  });
}


startVideoCall(): void {
  if (!this.currentRoomId) return;
  this.isStartingCall = true;
  this.roomService.startCall(this.currentRoomId).subscribe({
    next: (response) => {
      this.isStartingCall = false;
      if (response && response.meetLink) {
        window.open(response.meetLink, '_blank');
      }
    },
    error: (err) => {
      this.isStartingCall = false;
      console.error('Failed to start video call:', err);
    }
  });
}

  ngOnInit(): void {

    const userId = localStorage.getItem('userId');
    this.currentUserId = userId ? userId : '';
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
 this.socketService.listen('messagePinned').subscribe((updatedMessage: Message) => {
    const index = this.messages.findIndex(m => m._id === updatedMessage._id);
    if (index !== -1) {
      // Créer une nouvelle copie du message avec les nouvelles propriétés
      this.messages[index] = { ...this.messages[index], ...updatedMessage };
      // Forcer la détection de changement en créant un nouveau tableau
      this.messages = [...this.messages];
      
      // Forcer le rafraîchissement de la vue
      setTimeout(() => {
        // Déclencher la détection de changement
      }, 0);
    }
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
    this.socketService.emit('updateMessage', updatedMsg);
  });
}
// Dans votre component TypeScript

// Dans votre component TypeScript
/*
pinMessage(messageId: string): void {
  this.messageService.pinMessage(messageId).subscribe({
    next: (updatedMsg) => {
      // Mettre à jour le message localement
      const index = this.messages.findIndex(m => m._id === updatedMsg._id);
      if (index !== -1) {
        // Créer une nouvelle copie du message avec les nouvelles propriétés
        this.messages[index] = { ...this.messages[index], ...updatedMsg };
        // Forcer la détection de changement en créant un nouveau tableau
        this.messages = [...this.messages];
        
        // Forcer la détection de changement d'Angular
        setTimeout(() => {
          // Trigger change detection
        }, 0);
      }
      
      // Émettre la mise à jour via WebSocket pour les autres utilisateurs
      this.socketService.emit('messagePinned', updatedMsg);
      
      // Optionnel: afficher une notification
      const action = updatedMsg.isPinned ? 'épinglé' : 'désépinglé';
      console.log(`Message ${action} avec succès`);
    },
    error: (err) => {
      console.error("Erreur lors du pin/unpin du message:", err);
    }
  });
}*/

ngOnChanges() {
  if (this.roomId) {
    this.messageService.getMessagesByRoom(this.roomId).subscribe();
  }}

loadMessages(roomId: string) {
  this.messages = [];
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
showPinnedMessagesModal(): void {
  this.showPinnedModal = true;
}

// Method to close the pinned messages modal
closePinnedMessagesModal(): void {
  this.showPinnedModal = false;
}

// Method to get pinned messages
getPinnedMessages(): any[] {
  return this.messages.filter(msg => msg.isPinned);
}

// Method to start editing from modal and close modal
startEditingFromModal(messageId: string, content: string): void {
  this.startEditing(messageId, content);
  this.closePinnedMessagesModal();
}

// Method to jump to a specific message and close modal
/*jumpToMessage(messageId: string): void {
  this.closePinnedMessagesModal();
  // Scroll to the message in the chat
  setTimeout(() => {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Optional: highlight the message briefly
      messageElement.classList.add('highlight');
      setTimeout(() => {
        messageElement.classList.remove('highlight');
      }, 2000);
    }
  }, 100);
}*/

// Dans votre component TypeScript

jumpToMessage(messageId: string): void {
  this.closePinnedMessagesModal();
  
  // Attendre que le modal soit fermé et le DOM mis à jour
  setTimeout(() => {
    // Essayer plusieurs sélecteurs possibles
    let messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    
    // Si le premier sélecteur ne fonctionne pas, essayer avec l'ID
    if (!messageElement) {
      messageElement = document.getElementById(`message-${messageId}`);
    }
    
    // Si toujours pas trouvé, chercher dans tous les éléments avec une classe message
    if (!messageElement) {
      const allMessages = document.querySelectorAll('.message, .message-item, .chat-message');
      messageElement = Array.from(allMessages).find(el => 
        el.getAttribute('data-id') === messageId || 
        el.id === messageId ||
        el.classList.contains(`msg-${messageId}`)
      ) || null;
    }
    
    if (messageElement) {
      // Scroll vers le message
      messageElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      });
      
      // Ajouter un effet de surbrillance
      messageElement.classList.add('highlight-message');
      
      // Retirer l'effet après 3 secondes
      setTimeout(() => {
        messageElement?.classList.remove('highlight-message');
      }, 3000);
      
      console.log('Message trouvé et scroll effectué:', messageId);
    } else {
      console.warn('Message non trouvé dans le DOM:', messageId);
      console.log('Messages disponibles:', document.querySelectorAll('[data-message-id], .message, .message-item'));
    }
  }, 200); // Augmenter le délai pour s'assurer que le modal est fermé
}
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

 /*markAllMessagesAsSeen(): void {
    if (!this.roomId) return;
    
    this.messageService.markMessagesAsSeen(this.roomId).subscribe({
      next: () => {
        // Update local state
        this.messages = this.messages.map(msg => ({
          ...msg,
          seenBy: msg.sender !== this.currentUserId 
            ? [...(msg.seenBy || []), { userId: this.currentUserId, seenAt: new Date() }]
            : msg.seenBy
        }));
        
        // Notify others via socket
        this.socketService.emitMessagesSeen(this.roomId);
      },
      error: (err) => console.error('Error marking messages as seen:', err)
    });
  } */

}