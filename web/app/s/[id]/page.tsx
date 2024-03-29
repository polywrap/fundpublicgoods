import Disclaimer from "@/components/Disclaimer";
import RealtimeLogs from "@/components/RealtimeLogs";
import Strategy from "@/components/Strategy";
import NoResultsFound from "@/components/NoResultsFound";
import {
  StrategiesWithProjects,
  Application,
} from "@/hooks/useStrategiesHandler";
import { getNetworkNameFromChainId, NetworkName } from "@/utils/ethereum";
import { checkIfFinished } from "@/utils/logs";
import { createSupabaseServerClient } from "@/utils/supabase-server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function StrategyPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createSupabaseServerClient(cookies());

  const run = await supabase
    .from("runs")
    .select(
      `
      id,
      created_at,
      prompt,
      strategy_entries(
        *,
        project:projects(
          *,
          applications(
            network,
            created_at,
            recipient
          )
        )
      ),
      logs(
        id,
        run_id,
        created_at,
        value,
        ended_at,
        status,
        step_name
      )
    `
    )
    .eq("id", params.id)
    .single();

  if (run.error || !run.data) {
    console.error(run.error);
    redirect(`/?not-found=${params.id}`)
  }

  const strategyCreated = checkIfFinished(run.data.logs);
  if (!strategyCreated) {
    return (
      <div className='w-full flex flex-col items-center justify-between h-full pt-16 pb-8 px-6'>
        <div className='w-full max-w-screen-md space-y-8 px-2'>
          <RealtimeLogs
            logs={run.data.logs}
            run={{ id: params.id, prompt: run.data.prompt }}
          />
        </div>
        <Disclaimer />
      </div>
    );
  }

  const data = run.data.strategy_entries as unknown as StrategiesWithProjects;

  const recipientInformation = data.map((s) => {
    const applications = s.project.applications.sort(
      (a, b) => a.created_at - b.created_at
    );

    const appsByNetwork: Partial<Record<NetworkName, Application>> = {};
    applications.forEach((app) => {
      const networkName = getNetworkNameFromChainId(app.network);
      if (!appsByNetwork[networkName]) {
        appsByNetwork[networkName] = app;
      }
    });

    return {
      networks: Object.keys(appsByNetwork) as NetworkName[],
      recipients: Object.values(appsByNetwork).map((x) => x.recipient),
    };
  });

  const totalScore = data.reduce((acc, x) => acc + (x.smart_ranking || 0), 0)

  const strategies = data
    .map((strategy, i) => {
      return {
        ...strategy,
        defaultWeight: strategy.smart_ranking || 0 / totalScore,
        networks: recipientInformation[i].networks,
        recipients: recipientInformation[i].recipients,
      };
    })
    .sort((a, b) => (b.smart_ranking || 0) - (a.smart_ranking || 0));

  const uniqueNetworks = Array.from(
    new Set(strategies.map((x) => x.networks).flat())
  );

  if (strategies.length > 0) {
    return (
      <Strategy
        fetchedStrategies={strategies}
        prompt={run.data.prompt}
        runId={run.data.id}
        networks={uniqueNetworks}
      />
    );
  } else {
    return (
      <NoResultsFound
        prompt={run.data.prompt}
      />
    );
  }
}
