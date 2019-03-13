import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.page.html',
  styleUrls: ['./preferences.page.scss']
})
export class PreferencesPage implements OnInit {
  options: FormGroup;
  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.options = this.fb.group({
      bottom: 0,
      fixed: false,
      top: 0
    });
  }
}
