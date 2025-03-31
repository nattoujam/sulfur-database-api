import { expect, it, describe } from "vitest";

import { toKatakana, toHiragana } from "./japanese";

describe("#toKatakana", () => {
  describe("only hiragana", () => {
    it("convert to katakana", () => {
      expect(toKatakana("きのこ")).toEqual("キノコ");
    });
  });

  describe("only katakana", () => {
    it("convert to katakana", () => {
      expect(toKatakana("キノコ")).toEqual("キノコ");
    });
  });

  describe("mix hiragana and katakana", () => {
    it("convert to katakana", () => {
      expect(toKatakana("きノコ")).toEqual("キノコ");
    });
  });
});

describe("#toHiragana", () => {
  describe("only hiragana", () => {
    it("convert to hiragana", () => {
      expect(toHiragana("きのこ")).toEqual("きのこ");
    });
  });

  describe("only katakana", () => {
    it("convert to hiragana", () => {
      expect(toHiragana("キノコ")).toEqual("きのこ");
    });
  });

  describe("mix hiragana and katakana", () => {
    it("convert to hiragana", () => {
      expect(toHiragana("きノコ")).toEqual("きのこ");
    });
  });
});
