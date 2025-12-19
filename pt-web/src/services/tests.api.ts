import {testsMockEn as testsEn} from "src/dictionary/dictionaries/tests/tests.mock.en";
import {testsMockRu as testsRu} from "src/dictionary/dictionaries/tests/tests.mock.ru";
import type {Language} from "src/dictionary/dictionaryLoader";

export interface TextQuestion {
  id: number;
  type: "text";
  question: string;
  placeholder: string;
}

export interface RadioQuestion {
  id: number;
  type: "radio";
  question: string;
  options: string[];
}

export interface CheckboxQuestion {
  id: number;
  type: "checkbox";
  question: string;
  options: string[];
}

export type Question = TextQuestion | RadioQuestion | CheckboxQuestion;

export interface Test {
  id: string;
  name: string;
  questions: Question[];
}

export async function loadTestById(testId: string, lang: Language): Promise<Test> {
  const store = lang === "ru" ? testsRu : testsEn;

  return Promise.resolve(store[testId]);
}

export async function loadTestsIndex(lang: Language): Promise<Array<Pick<Test, "id" | "name">>> {
  const store = lang === "ru" ? testsRu : testsEn;

  return Promise.resolve(Object.values(store).map(test => ({id: test.id, name: test.name})));
}
