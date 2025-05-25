import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { RouterModule } from "@angular/router";
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-main-layout',
  imports: [
    NavbarComponent,
    RouterModule,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {

}
