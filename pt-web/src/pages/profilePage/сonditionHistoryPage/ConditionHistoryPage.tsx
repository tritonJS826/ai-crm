import React, {useEffect, useMemo, useState} from "react";
import {useParams} from "react-router-dom";
import {PageHeader} from "src/components/PageHeader/PageHeader";
import {DictionaryKey} from "src/dictionary/dictionaryLoader";
import {useDictionary} from "src/dictionary/useDictionary";
import {
  getUserTestResults,
  type TestSession,
  type UserTestResults,
} from "src/services/profile";
import styles from "src/pages/profilePage/сonditionHistoryPage/ConditionHistoryPage.module.scss";

const INDEX_OFFSET = 1;

type ProfileDictionary = {
  history: {
    titlePrefix: string;
    emptyTitle: string;
    emptySubtitle: string;
    date: string;
    name: string;
    status: string;
    recommendation: string;
    finished: string;
    inProgress: string;
    question: string;
    answer: string;
  };
};

function formatDate(iso?: string | null): string {
  if (!iso) {
    return "—";
  }
  const date = new Date(iso);

  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function getSessionLabel(session: TestSession, index: number): string {
  const numberHuman = index + INDEX_OFFSET;

  return `#${numberHuman} — ${formatDate(session.created_at)}`;
}

export function ConditionHistoryPage() {
  const {id} = useParams<{ id: string }>();
  const dict = useDictionary(DictionaryKey.PROFILE) as ProfileDictionary | null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<UserTestResults | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!id) {
        if (mounted) {
          setResults(null);
          setLoading(false);
        }

        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await getUserTestResults(id);
        if (!mounted) {
          return;
        }
        setResults(data);
      } catch (e) {
        if (!mounted) {
          return;
        }
        const message = e instanceof Error ? e.message : "Failed to load test results";
        setError(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [id]);

  const sessionsSorted = useMemo(
    () =>
      (results?.sessions ?? [])
        .slice()
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
    [results],
  );

  if (!dict) {
    return (
      <div className={styles.page}>
        <PageHeader
          title="Loading..."
          subtitle=""
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <PageHeader
          title={`${dict.history.titlePrefix} …`}
          subtitle=""
        />
        <section className={styles.card}>
          Loading…
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <PageHeader
          title={`${dict.history.titlePrefix} —`}
          subtitle=""
        />
        <section className={styles.card}>
          <div className={styles.errorMessage}>
            {error}
          </div>
        </section>
      </div>
    );
  }

  if (!id || !results || sessionsSorted.length === 0) {
    return (
      <div className={styles.page}>
        <PageHeader
          title={dict.history.emptyTitle}
          subtitle={dict.history.emptySubtitle}
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title={`${dict.history.titlePrefix} ${results.title ?? id}`}
        subtitle={results.description ?? ""}
      />

      <div className={styles.tableWrap}>
        <table
          className={styles.table}
          aria-label={`${results.title} sessions`}
        >
          <thead>
            <tr>
              <th>
                {dict.history.date}
              </th>
              <th>
                {dict.history.name}
              </th>
              <th>
                {dict.history.status}
              </th>
            </tr>
          </thead>
          <tbody>
            {sessionsSorted.map((session, index) => (
              <tr key={session.session_id}>
                <td data-label={dict.history.date}>
                  {formatDate(session.created_at)}
                </td>
                <td data-label={dict.history.name}>
                  {getSessionLabel(session, index)}
                </td>
                <td data-label={dict.history.status}>
                  {session.finished_at ? dict.history.finished : dict.history.inProgress}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className={styles.card}>
        {sessionsSorted.map((session, index) => (
          <details
            key={session.session_id}
            open={index === 0}
            className={styles.sessionBlock}
          >
            <summary className={styles.sessionSummary}>
              {getSessionLabel(session, index)}
              {" "}
              ·
              {" "}
              {session.finished_at ? dict.history.finished : dict.history.inProgress}
            </summary>

            {session.answers.length === 0
              ? (
                <div className={styles.sessionEmpty}>
                  {dict.history.emptySubtitle}
                </div>
              )
              : (
                <div className={styles.tableWrap}>
                  <table
                    className={styles.table}
                    aria-label={`answers ${session.session_id}`}
                  >
                    <thead>
                      <tr>
                        <th>
                          {dict.history.question}
                        </th>
                        <th>
                          {dict.history.answer}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {session.answers.map((answer) => (
                        <tr key={answer.question_id}>
                          <td data-label={dict.history.question}>
                            {answer.question_text}
                          </td>
                          <td data-label={dict.history.answer}>
                            {answer.answer}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </details>
        ))}
      </section>
    </div>
  );
}
