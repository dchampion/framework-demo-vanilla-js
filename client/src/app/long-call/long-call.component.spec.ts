import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LongCallComponent } from './long-call.component';

describe('LongCallComponent', () => {
  let component: LongCallComponent;
  let fixture: ComponentFixture<LongCallComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LongCallComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LongCallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
