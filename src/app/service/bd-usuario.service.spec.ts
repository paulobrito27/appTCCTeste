import { TestBed } from '@angular/core/testing';

import { BdUsuarioService } from './bd-usuario.service';

describe('BdUsuarioService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BdUsuarioService = TestBed.get(BdUsuarioService);
    expect(service).toBeTruthy();
  });
});
