import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatRoutingModule } from './chat-routing.module';
import {RoomComponent} from './components/room/room.component';
import {InboxComponent} from './components/inbox/inbox.component';
import {ChatComponent} from './components/chat/chat.component';
import {PlaceholderComponent} from './components/placeholder/placeholder.component';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ChatRoutingModule,
    RoomComponent,
    InboxComponent,
    ChatComponent,
    PlaceholderComponent
  ]
})
export class ChatModule { }
