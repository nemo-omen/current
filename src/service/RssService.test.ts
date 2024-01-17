import { describe, expect, test } from 'bun:test';
import { RssService } from './RssService';


describe("Test isValidUrl", () => {
  const service = new RssService();
  test("just a string is false", () => {
    const result = service.isValidURL('notaurl');
    expect(result).toBe(false);
  });

  test("string with no protocol is false", () => {
    const result = service.isValidURL("whatever.com");
    expect(result).toBe(false);
  });

  test("string with only protocol is false", () => {
    const result = service.isValidURL("https://");
    expect(result).toBe(false);
  });

  test("relative path should be false", () => {
    const result = service.isValidURL("/whatever");
    expect(result).toBe(false);
  });

  test("url without domain should be true", () => {
    const result = service.isValidURL("https://whatever");
    expect(result).toBe(true);
  });

  test("url with domain should be true", () => {
    const result = service.isValidURL("https://whatever.whatever");
    expect(result).toBe(true);
  });

  test("url with domain and path should be true", () => {
    const result = service.isValidURL("https://whatever.whatever/whatever");
    expect(result).toBe(true);
  });
});

describe("Test buildUrl", () => {
  const service = new RssService();

  test("builds non-domain url string from string", () => {
    const result = service.buildUrl("whatever");
    expect(result.ok).toBe(true);
    expect(result.data).toBe("https://whatever");
    expect(service.isValidURL(result.data)).toBe(true);
  });
});