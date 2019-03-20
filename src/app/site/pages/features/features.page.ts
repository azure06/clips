import { Component } from '@angular/core';
import { faFacebookSquare } from '@fortawesome/free-brands-svg-icons/faFacebookSquare';
import { faPinterest } from '@fortawesome/free-brands-svg-icons/faPinterest';
import { faTwitterSquare } from '@fortawesome/free-brands-svg-icons/faTwitterSquare';

@Component({
  selector: 'app-features',
  templateUrl: './features.page.html',
  styleUrls: ['./features.page.scss']
})
export class FeaturesPage {
  private fbIcon = faFacebookSquare;
  private pinIcon = faPinterest;
  private tweetIcon = faTwitterSquare;
  constructor() {}
}
