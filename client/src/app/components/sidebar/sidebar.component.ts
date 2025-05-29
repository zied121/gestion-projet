import {Component, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {NgClass, NgIf} from '@angular/common';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  imports: [
    RouterLinkActive,
    NgClass,
    NgIf,
    RouterLink
  ],
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  @Input() iscollapsed = true;
  @Output() toggle = new EventEmitter<void>();

  triggerToggle() {
    this.toggle.emit();
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.sidebar') && !target.closest('.sidebar-toggle')) {
      this.iscollapsed = true;
    }
  }
}
