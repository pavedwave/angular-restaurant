import { HighlightDirective } from './highlight.directive';
import { moveCursor } from 'readline';

describe('HighlightDirective', () => {
  it('should create an instance', () => {
    const directive = new HighlightDirective();
    expect(directive).toBeTruthy();
  });
});
