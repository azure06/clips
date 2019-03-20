import { library } from '@fortawesome/fontawesome-svg-core';

// tslint:disable:no-submodule-imports
import { faFacebookF } from '@fortawesome/free-brands-svg-icons/faFacebookF';
import { faLine } from '@fortawesome/free-brands-svg-icons/faLine';
import { faLinkedinIn } from '@fortawesome/free-brands-svg-icons/faLinkedinIn';
import { faTwitter } from '@fortawesome/free-brands-svg-icons/faTwitter';

const icons = [faFacebookF, faTwitter, faLinkedinIn, faLine];

library.add(...icons);
