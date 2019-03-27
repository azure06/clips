import { Component, Input, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material';

/** Error when invalid control is dirty, touched, or submitted. */
export class ContractErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

// tslint:disable-next-line: max-classes-per-file
@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss']
})
export class ContactPage {
  @Input()
  matcher = new ContractErrorStateMatcher();
  public nameFormControl = new FormControl('', [Validators.required]);
  public emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email
  ]);
  public contentFormControl = new FormControl('', [Validators.required]);

  constructor() {}
}
