import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {useAtomValue} from "jotai";
import {languageAtomWithPersistence} from "src/dictionary/dictionaryAtom";
import {DictionaryKey} from "src/dictionary/dictionaryLoader";
import {useDictionary} from "src/dictionary/useDictionary";
import {loadTestById as loadTest, type Test} from "src/services/tests.api";
import styles from "src/pages/testsListPage/tests/Test.module.scss";

async function loadData<T extends object>(
  callback: () => Promise<T>,
  callbackHandler: (param: T) => void) {
  const response = await callback();
  callbackHandler(response);
}

const INCREMENT = 1;

// String - for inputText, inputRadio
// string[] - for inputCheckbox
type Answer = string | string[]

// TODO: move to utils
function toggleStringInArray(arr: string[], string: string) {
  const index = arr.indexOf(string); // Check if the string exists in the array
  const NOT_EXISTENT_INDEX = -1;
  if (index === NOT_EXISTENT_INDEX) {
    // If the string is not found, add it to the array
    return [...arr, string]; // Returns a new array with the string added
  } else {
    // If the string is found, remove it from the array
    return arr.filter(item => item !== string); // Returns a new array with the string removed
  }
}

export function Test() {
  const [userAnswers, setUserAnswers] = useState<Answer[]>([]);
  const [test, setTest] = useState<Test>();
  const dictionary = useDictionary(DictionaryKey.COMMON);

  const lang = useAtomValue(languageAtomWithPersistence);
  const {id} = useParams<{ id: string }>();

  const setupStates = (testFromBack: Test) => {
    const emptyAnswers: Answer[] = testFromBack.questions.map(question => {
      switch (question.type) {
        case "checkbox":
          return [];
        case "radio":
          return "";
        case "text":
          return "";
      }
    });

    setUserAnswers(emptyAnswers);
    setTest(testFromBack);
  };

  useEffect(() => {
    if (!id) {
      return;
    }

    setTest(undefined);
    setUserAnswers([]);

    loadData(
      () => loadTest(id, lang),
      setupStates,
    );
  }, [id, lang]);

  if (!dictionary) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  const handleSubmit = () => {

    /**
     * TODO: finish form handling
     */
    alert("Отправлено!");
    // eslint-disable-next-line no-console
    console.log(userAnswers);
  };

  const handelInputChange = (e: React.ChangeEvent<HTMLInputElement>, questionIndex: number) => {
    const newAnswer = e.target.value;
    const isCheckbox = e.target.type === "checkbox";

    const newAnswers = userAnswers.map((answer, i) => {
      // Skip other answers
      if (i !== questionIndex) {
        return answer;
      }

      // Handle checkboxes groups
      if (isCheckbox) {
        if (!Array.isArray(answer)) {
          throw new Error("Wrong type! Should be array");
        }
        const newAnswerArray = toggleStringInArray(Array.from(answer), newAnswer);

        return newAnswerArray;
      }

      // For radioInput and textInput
      return newAnswer;
    });

    setUserAnswers(newAnswers);
  };

  const isRadioAnswered = (answerIndex: number, option: string) => {
    return userAnswers[answerIndex] === option;
  };

  const isCheckboxAnswered = (answerIndex: number, option: string) => {
    const answer = userAnswers[answerIndex];

    return Array.isArray(answer) && answer.includes(option);
  };

  if (test === undefined) {
    return (
      <>
        ...Loading...
      </>
    );
  }

  return (
    <>
      <h2 className={styles.testName}>
        {test.name}
      </h2>
      <form className={styles.form}>
        {test.questions.length === 0
          ? (
            <div className={styles.spinner} />
          )
          : (
            test.questions.map((question, questionIndex) => (
              <div
                key={question.id}
                className={styles.block}
              >
                <label className={styles.label}>
                  <span className={styles.num}>
                    {questionIndex + INCREMENT}
                    .
                  </span>
                  {question.question}
                </label>

                {question.type === "text" && (
                  <input
                    className={styles.textInput}
                    type="text"
                    name={String(question.id)}
                    placeholder={question.placeholder}
                    value={userAnswers[questionIndex]}
                    onChange={(e) => handelInputChange(e, questionIndex)}
                  />
                )}

                {question.type === "radio" && (
                  <div className={styles.options}>
                    {question.options.map(option => (
                      <label
                        key={option}
                        className={styles.option}
                      >
                        <input
                          className={styles.radio}
                          type="radio"
                          name={String(question.id)}
                          value={option}
                          checked={isRadioAnswered(questionIndex, option)}
                          onChange={(e) => handelInputChange(e, questionIndex)}
                        />
                        <span className={styles.optionText}>
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === "checkbox" && (
                  <div className={styles.options}>
                    {question.options.map(option => (
                      <label
                        key={option}
                        className={styles.option}
                      >
                        <input
                          className={styles.checkbox}
                          type="checkbox"
                          name={String(question.id)}
                          value={option}
                          checked={isCheckboxAnswered(questionIndex, option)}
                          onChange={(e) => handelInputChange(e, questionIndex)}
                        />
                        <span className={styles.optionText}>
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        <button
          type="button"
          className={styles.submit}
          onClick={handleSubmit}
        >
          {dictionary.buttons.submitTest}
        </button>
      </form>
    </>
  );
}
