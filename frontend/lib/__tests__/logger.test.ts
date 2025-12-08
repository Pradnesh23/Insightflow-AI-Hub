import { logger } from '../logger';

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log info messages', () => {
    const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
    
    logger.info('Test message', { key: 'value' });
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should log error messages', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const error = new Error('Test error');
    
    logger.error('Error occurred', error);
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should track timing', () => {
    const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
    
    const endTimer = logger.startTimer('test-operation');
    endTimer();
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should track events', () => {
    const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
    
    logger.trackEvent('user-action', { action: 'click' });
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
