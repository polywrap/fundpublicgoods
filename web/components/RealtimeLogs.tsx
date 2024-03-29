"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Tables } from "@/supabase/dbTypes";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import LoadingCircle from "@/components/LoadingCircle";
import ProgressBar from "@/components/ProgressBar";
import useSession from "@/hooks/useSession";
import {
  UNSTARTED_TEXTS,
  LOADING_TEXTS,
  STEPS_ORDER,
  STEP_TIME_ESTS,
  COMPLETED_TEXTS,
} from "@/utils/logs";
import TimeRemaining from "./TimeRemaining";
import { useProgressTime } from "@/hooks/useProgressTime";
import TextField from "./TextField";
import ChatInputButton from "./ChatInputButton";
import { startRun } from "@/app/actions";

const getLogMessage = (log: Tables<"logs">) => {
  switch (log.status) {
    case "NOT_STARTED":
      return UNSTARTED_TEXTS[log.step_name];
    case "IN_PROGRESS":
      return LOADING_TEXTS[log.step_name] + "...";
    case "COMPLETED":
      return log.value || COMPLETED_TEXTS[log.step_name];
    case "ERRORED":
      return `Something went wrong, please try again. If error persists contact dev team`;
  }
};

export default function RealtimeLogs(props: {
  logs: Tables<"logs">[];
  run: {
    id: string;
    prompt: string;
  };
}) {
  const [hasErrored, setHasErrored] = useState(
    !!props.logs.find((l) => l.status === "ERRORED")
  );
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { data: session } = useSession();
  const sortedLogsWithSteps = props.logs.sort((a, b) => {
    return STEPS_ORDER[a.step_name] - STEPS_ORDER[b.step_name];
  });
  const progressInformation = useProgressTime(
    Object.values(STEP_TIME_ESTS),
    sortedLogsWithSteps
  );

  const supabase = createSupabaseBrowserClient(
    session?.supabaseAccessToken ?? ""
  );
  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel("logs-added")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          table: "logs",
          schema: "public",
          filter: `run_id=eq.${props.run.id}`,
        },
        (payload) => {
          if (payload.new.status === "ERRORED") {
            setHasErrored(true);
          }

          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, props.run.id, router]);

  return (
    <>
      <div className="flex flex-col gap-2">
        <TextField
          label="Results for"
          value={props.run.prompt}
          readOnly
          rightAdornment={
            hasErrored && (
              <ChatInputButton
                running={isRegenerating}
                message={props.run.prompt}
                regenerate
                handleSend={async () => {
                  setIsRegenerating(true);
                  const response = await startRun(
                    props.run.prompt,
                    session?.supabaseAccessToken ?? ""
                  );
                  router.push(`/s/${response.runId}`);
                  setIsRegenerating(false);
                }}
              />
            )
          }
        />
      </div>
      <div className="mx-auto max-w-screen-sm space-y-2">
        {!hasErrored && (
          <>
            <TimeRemaining time={progressInformation.time} />
            <ProgressBar
              progress={progressInformation.progress}
              className={"!stroke-indigo-500 text-indigo-200 rounded-lg"}
            />
          </>
        )}
        {sortedLogsWithSteps
          .filter((log) => log.status !== "NOT_STARTED")
          .map((log) => (
            <div className="flex items-center space-x-2" key={log.id}>
              {log.status === "IN_PROGRESS" ? (
                <LoadingCircle
                  hideText={true}
                  className="!stroke-indigo-500 text-indigo-200"
                />
              ) : log.status === "COMPLETED" ? (
                <div
                  className="text-sm px-0.5 h-4 flex items-center"
                  role="img"
                  aria-label="check mark symbol"
                >
                  ✅
                </div>
              ) : (
                <div
                  className="text-sm px-0.5 h-4 flex items-center"
                  role="img"
                  aria-label="no entry"
                >
                  ⛔️
                </div>
              )}
              <p
                className={clsx(
                  "text-xs leading-tight",
                  log.status === "IN_PROGRESS"
                    ? "text-indigo-500"
                    : log.status === "COMPLETED"
                    ? "text-green-600"
                    : "text-red-500"
                )}
              >
                {getLogMessage(log)}
              </p>
            </div>
          ))}
      </div>
    </>
  );
}
