// calendar-header.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-calendar-header',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './calendar-header.component.html',
})
export class CalendarHeaderComponent {
  @Input() currentMonth!: Date;
  @Output() monthChange = new EventEmitter<Date>();

  get selectedMonthLabel(): string {
    return this.currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  prevMonth(): void {
    const newMonth = new Date(this.currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    this.monthChange.emit(newMonth);
  }

  nextMonth(): void {
    const newMonth = new Date(this.currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    this.monthChange.emit(newMonth);
  }

  today(): void {
    this.monthChange.emit(new Date());
  }
}