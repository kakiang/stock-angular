import { TestBed } from '@angular/core/testing';

import { UiMessageService } from './ui-message.service';

describe('UiMessageService', () => {
  let service: UiMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UiMessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
