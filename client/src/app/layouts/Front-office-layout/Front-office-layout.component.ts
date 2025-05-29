import {Component, HostListener} from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { RouterModule } from "@angular/router";
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-front-layout',
  imports: [
    SidebarComponent,
    RouterModule,
  ],
  templateUrl: './Front-office-layout.component.html',
  styleUrls: ['./Front-office-layout.component.css'],
})
export class FrontofficelayoutComponent {
  isSidebarCollapsed = true;

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.sidebar') && !target.closest('.sidebar-toggle')) {
      this.isSidebarCollapsed = true;
    }
  }
}
