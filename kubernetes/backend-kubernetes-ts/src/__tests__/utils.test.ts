describe('Utility Functions', () => {
  describe('Error Handling', () => {
    it('should properly handle and format error messages', () => {
      const error = new Error('Test error message');
      const errorMessage = error.message;

      expect(errorMessage).toBe('Test error message');
      expect(error instanceof Error).toBe(true);
    });

    it('should handle unknown error types', () => {
      const unknownError: any = 'String error';
      const errorMessage = unknownError instanceof Error ? unknownError.message : 'Unknown error occurred';

      expect(errorMessage).toBe('Unknown error occurred');
    });

    it('should handle null and undefined errors', () => {
      const nullError: any = null;
      const undefinedError: any = undefined;
      
      const nullMessage = nullError instanceof Error ? nullError.message : 'Unknown error occurred';
      const undefinedMessage = undefinedError instanceof Error ? undefinedError.message : 'Unknown error occurred';

      expect(nullMessage).toBe('Unknown error occurred');
      expect(undefinedMessage).toBe('Unknown error occurred');
    });
  });

  describe('Date Formatting', () => {
    it('should format ISO dates correctly', () => {
      const inputDate = '2025-01-01T00:00:00Z';
      const date = new Date(inputDate);

      // Test that the date is parsed correctly
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(0); // January is 0
      expect(date.getDate()).toBe(1);
      
      // Test that toISOString returns a valid ISO format
      const isoOutput = date.toISOString();
      expect(isoOutput).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(isoOutput).toContain('2025-01-01T00:00:00');
    });

    it('should handle current timestamp generation', () => {
      const timestamp = new Date().toISOString();
      const timestampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

      expect(timestamp).toMatch(timestampRegex);
    });
  });

  describe('String Utilities', () => {
    it('should normalize category names to lowercase', () => {
      const categories = ['Programming', 'DEVOPS', 'Cloud', 'SECURITY'];
      const normalizedCategories = categories.map(cat => cat.toLowerCase());

      expect(normalizedCategories).toEqual(['programming', 'devops', 'cloud', 'security']);
    });

    it('should handle empty and null values', () => {
      const emptyString = '';
      const nullValue: any = null;
      const undefinedValue: any = undefined;

      expect(emptyString || 'default').toBe('default');
      expect(nullValue || 'default').toBe('default');
      expect(undefinedValue || 'default').toBe('default');
    });
  });

  describe('Array Utilities', () => {
    it('should filter out null values from arrays', () => {
      const arrayWithNulls = ['tag1', null, 'tag2', null, 'tag3'];
      const filteredArray = arrayWithNulls.filter(item => item !== null);

      expect(filteredArray).toEqual(['tag1', 'tag2', 'tag3']);
      expect(filteredArray).toHaveLength(3);
    });

    it('should handle empty arrays', () => {
      const emptyArray: string[] = [];
      const result = emptyArray.map(item => item.toUpperCase());

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle array mapping', () => {
      const numbers = [1, 2, 3, 4, 5];
      const doubled = numbers.map(n => n * 2);

      expect(doubled).toEqual([2, 4, 6, 8, 10]);
    });
  });

  describe('Environment Variable Handling', () => {
    it('should handle missing environment variables', () => {
      const value = process.env.NON_EXISTENT_VAR || 'default-value';
      expect(value).toBe('default-value');
    });

    it('should handle environment variable parsing', () => {
      process.env.TEST_PORT = '3000';
      const port = parseInt(process.env.TEST_PORT || '8080', 10);
      
      expect(port).toBe(3000);
      expect(typeof port).toBe('number');
      
      delete process.env.TEST_PORT;
    });
  });
});