import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export type CalendarView = 'month' | 'week' | 'day';

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
  @Input() currentView: CalendarView = 'month';
  @Output() monthChange = new EventEmitter<Date>();

  get selectedMonthLabel(): string {
    switch (this.currentView) {
      case 'month':
        return this.currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
      case 'week':
        const startOfWeek = this.getStartOfWeek(this.currentMonth);
        const endOfWeek = this.getEndOfWeek(this.currentMonth);
        if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
          return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} ${startOfWeek.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
        } else {
          return `${startOfWeek.toLocaleString('default', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        }
      case 'day':
        return this.currentMonth.toLocaleString('default', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      default:
        return this.currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
    }
  }

  get navigationButtonText(): { prev: string, next: string } {
    switch (this.currentView) {
      case 'month':
        return { prev: 'Previous Month', next: 'Next Month' };
      case 'week':
        return { prev: 'Previous Week', next: 'Next Week' };
      case 'day':
        return { prev: 'Previous Day', next: 'Next Day' };
      default:
        return { prev: 'Previous', next: 'Next' };
    }
  }

  private getStartOfWeek(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day;
    return new Date(result.setDate(diff));
  }

  private getEndOfWeek(date: Date): Date {
    const result = this.getStartOfWeek(date);
    return new Date(result.setDate(result.getDate() + 6));
  }

  prevPeriod(): void {
    const newDate = new Date(this.currentMonth);
    
    switch (this.currentView) {
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
    }
    
    this.monthChange.emit(newDate);
  }

  nextPeriod(): void {
    const newDate = new Date(this.currentMonth);
    
    switch (this.currentView) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
    }
    
    this.monthChange.emit(newDate);
  }

  today(): void {
    this.monthChange.emit(new Date());
  }

  // Méthodes pour la compatibilité avec l'ancien code
  prevMonth(): void {
    this.prevPeriod();
  }

  nextMonth(): void {
    this.nextPeriod();
  }
}
