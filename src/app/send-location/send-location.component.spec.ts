import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendLocationComponent } from './send-location.component';

describe('SendLocationComponent', () => {
  let component: SendLocationComponent;
  let fixture: ComponentFixture<SendLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendLocationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SendLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
