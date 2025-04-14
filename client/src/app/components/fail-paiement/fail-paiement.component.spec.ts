import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FailPaiementComponent } from './fail-paiement.component';

describe('FailPaiementComponent', () => {
  let component: FailPaiementComponent;
  let fixture: ComponentFixture<FailPaiementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FailPaiementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FailPaiementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
