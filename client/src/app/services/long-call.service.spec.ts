import { TestBed } from '@angular/core/testing';

import { LongCallService } from './long-call.service';

describe('LongCallService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LongCallService = TestBed.get(LongCallService);
    expect(service).toBeTruthy();
  });
});
