import EmbeddedHtmlInfo from './embedded-html-info.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('embedded-html-info', () => {
  let sut;

  beforeEach(() => {
    sut = new EmbeddedHtmlInfo();
  });

  describe('redactContent', () => {
    it('redacts room-media resources from different rooms', () => {
      const result = sut.redactContent({
        html: '<img src="cdn://room-media/63cHjt3BAhGnNxzJGrTsN1/some-image.png">',
        css: 'body { background: url("cdn://room-media/63cHjt3BAhGnNxzJGrTsN1/bg.png"); }',
        js: '',
        width: 100
      }, 'rebhjf4MLq7yjeoCnYfn7E');
      expect(result).toStrictEqual({
        html: '<img src="">',
        css: 'body { background: url(""); }',
        js: '',
        width: 100
      });
    });

    it('leaves room-media resources from the same room intact', () => {
      const result = sut.redactContent({
        html: '<img src="cdn://room-media/63cHjt3BAhGnNxzJGrTsN1/some-image.png">',
        css: '',
        js: '',
        width: 100
      }, '63cHjt3BAhGnNxzJGrTsN1');
      expect(result).toStrictEqual({
        html: '<img src="cdn://room-media/63cHjt3BAhGnNxzJGrTsN1/some-image.png">',
        css: '',
        js: '',
        width: 100
      });
    });

    it('leaves non room-media resources intact', () => {
      const result = sut.redactContent({
        html: '<img src="cdn://media-library/JgTaqob5vqosBiHsZZoh1/some-image.png">',
        css: '',
        js: '',
        width: 100
      }, 'rebhjf4MLq7yjeoCnYfn7E');
      expect(result).toStrictEqual({
        html: '<img src="cdn://media-library/JgTaqob5vqosBiHsZZoh1/some-image.png">',
        css: '',
        js: '',
        width: 100
      });
    });
  });

  describe('getCdnResources', () => {
    it('returns CDN resources from html and css fields', () => {
      const result = sut.getCdnResources({
        html: '<img src="cdn://media-library/JgTaqob5vqosBiHsZZoh1/some-image.png"><img src="cdn://room-media/63cHjt3BAhGnNxzJGrTsN1/some-image.png"><img src="https://external-domain.org/some-image.png">',
        css: 'body { background: url("cdn://media-library/JgTaqob5vqosBiHsZZoh1/bg.png"); }',
        js: '',
        width: 100
      });
      expect(result).toStrictEqual([
        'cdn://media-library/JgTaqob5vqosBiHsZZoh1/some-image.png',
        'cdn://room-media/63cHjt3BAhGnNxzJGrTsN1/some-image.png',
        'cdn://media-library/JgTaqob5vqosBiHsZZoh1/bg.png'
      ]);
    });
  });
});
