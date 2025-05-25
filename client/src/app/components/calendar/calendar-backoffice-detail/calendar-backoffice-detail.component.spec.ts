import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarBackofficeDetailComponent } from './calendar-backoffice-detail.component';

describe('CalendarBackofficeDetailComponent', () => {
  let component: CalendarBackofficeDetailComponent;
  let fixture: ComponentFixture<CalendarBackofficeDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarBackofficeDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarBackofficeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
