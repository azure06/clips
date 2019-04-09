import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import ua from 'universal-analytics';
// tslint:disable-next-line:no-submodule-imports
import uuidv4 from 'uuid/v4';

const analyticsDir = path.join(app.getPath('userData'), 'analytics');
const userIdFile = path.join(analyticsDir, 'user.json');

app.on('ready', () => {
  if (!fs.existsSync(userIdFile)) {
    fs.mkdirSync(analyticsDir, { recursive: true });
    fs.writeFileSync(
      path.join(analyticsDir, 'user.json'),
      JSON.stringify({ userId: uuidv4() })
    );
  }

  const { userId }: { userId: string } = JSON.parse(
    fs.readFileSync(userIdFile, 'utf8')
  );
  const visitor = ua('UA-136774263-1', userId);

  const trackEvent = (category, action, label, value) => {
    return visitor
      .event({
        ec: category,
        ea: action,
        el: label,
        ev: value
      })
      .send();
  };

  global.eventTracker = { trackEvent, visitor };
});
