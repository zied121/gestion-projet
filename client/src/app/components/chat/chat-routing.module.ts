import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {ChatComponent} from './components/chat/chat.component';
import {PlaceholderComponent} from './components/placeholder/placeholder.component';
import {RoomComponent} from './components/room/room.component';

const routes: Routes = [

  {
    path: '',
    component: ChatComponent,
    children: [
      {
        path: '',
        component: PlaceholderComponent // shows when no room is selected
      },
      {
        path: ':id',
        component: RoomComponent // shows the selected room
      }
    ]
  }


];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatRoutingModule { }
