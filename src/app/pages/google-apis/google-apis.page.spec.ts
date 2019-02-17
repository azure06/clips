import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleApisPage } from './google-apis.page';

describe('Tab1Page', () => {
  let component: GoogleApisPage;
  let fixture: ComponentFixture<GoogleApisPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GoogleApisPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GoogleApisPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
