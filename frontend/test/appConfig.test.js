import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = pathToFileURL(path.join(__dirname, '..', 'src', 'config', 'app.config.js')).href;

describe('frontend app config contract', () => {
  it('exports required runtime configuration keys', async () => {
    const module = await import(configPath);
    const config = module.appConfig;
    assert.ok(config, 'appConfig must be exported');
    assert.ok(typeof config.apiBaseUrl === 'string' && config.apiBaseUrl.length > 0, 'apiBaseUrl is required');
    assert.ok(typeof config.socketUrl === 'string' && config.socketUrl.length > 0, 'socketUrl is required');
    assert.ok(typeof config.uploadUrl === 'string' && config.uploadUrl.length > 0, 'uploadUrl is required');
    assert.equal(typeof config.defaultShippingFee, 'number', 'defaultShippingFee must be numeric');
    assert.equal(typeof config.freeShippingThreshold, 'number', 'freeShippingThreshold must be numeric');
  });

  it('builds full image URLs consistently', async () => {
    const module = await import(configPath);
    const { getFullImageUrl } = module;
    assert.equal(typeof getFullImageUrl(null) === 'string' && getFullImageUrl(null).length > 0, true, 'fallback image should return a valid string path');
    assert.equal(getFullImageUrl('/uploads/x.jpg').includes('/uploads/x.jpg'), true, 'absolute paths should be preserved');
    assert.equal(getFullImageUrl('http://example.com/x.jpg'), 'http://example.com/x.jpg', 'external URLs should pass through');
  });

  it('formats VND currency correctly', async () => {
    const module = await import(configPath);
    const formatted = module.formatVND(123456);
    assert.match(formatted, /123\.456|123,456/, 'VND formatting should include thousands separator');
  });

  it('documents env variable expectations in .env.example', () => {
    const envExample = fs.readFileSync(path.join(__dirname, '..', '.env.example'), 'utf8');
    assert.match(envExample, /VITE_API_BASE_URL=/, '.env.example should define VITE_API_BASE_URL');
    assert.match(envExample, /VITE_SOCKET_URL=/, '.env.example should define VITE_SOCKET_URL');
    assert.match(envExample, /VITE_UPLOAD_URL=/, '.env.example should define VITE_UPLOAD_URL');
  });
});
