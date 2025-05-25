import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarBackofficeComponent } from './calendar-backoffice.component';

describe('CalendarBackofficeComponent', () => {
  let component: CalendarBackofficeComponent;
  let fixture: ComponentFixture<CalendarBackofficeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarBackofficeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarBackofficeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
