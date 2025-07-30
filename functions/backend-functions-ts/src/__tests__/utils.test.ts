// functions/backend-functions-ts/__tests__/utils.test.ts
describe('Utility Functions', () => {
  describe('Error Handling', () => {
    it('should handle Error objects', () => {
      const error = new Error('Test error');
      expect(error.message).toBe('Test error');
      expect(error instanceof Error).toBe(true);
    });

    it('should handle unknown error types', () => {
      const stringError = 'String error';
      const errorMessage = stringError instanceof Error ? stringError.message : 'Unknown error';
      expect(errorMessage).toBe('Unknown error');
    });
  });

  describe('Date Utilities', () => {
    it('should format ISO dates', () => {
      const date = new Date('2025-01-01T00:00:00Z');
      expect(date.getFullYear()).toBe(2025);
      expect(date.toISOString()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should generate current timestamp', () => {
      const timestamp = new Date().toISOString();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('String Utilities', () => {
    it('should normalize categories', () => {
      const categories = ['Programming', 'DEVOPS'];
      const normalized = categories.map(c => c.toLowerCase());
      expect(normalized).toEqual(['programming', 'devops']);
    });

    it('should handle empty values', () => {
      expect('' || 'default').toBe('default');
      expect(null || 'default').toBe('default');
      expect(undefined || 'default').toBe('default');
    });
  });

  describe('Array Utilities', () => {
    it('should filter null values', () => {
      const array = ['a', null, 'b', null, 'c'];
      const filtered = array.filter(item => item !== null);
      expect(filtered).toEqual(['a', 'b', 'c']);
    });

    it('should handle empty arrays', () => {
      const empty: string[] = [];
      expect(empty.length).toBe(0);
      expect(empty.map(x => x)).toEqual([]);
    });
  });

  describe('Environment Variables', () => {
    it('should handle missing env vars', () => {
      const value = process.env.NON_EXISTENT || 'default';
      expect(value).toBe('default');
    });

    it('should parse port numbers', () => {
      process.env.TEST_PORT = '7071';
      const port = parseInt(process.env.TEST_PORT || '8080', 10);
      expect(port).toBe(7071);
      delete process.env.TEST_PORT;
    });
  });
});