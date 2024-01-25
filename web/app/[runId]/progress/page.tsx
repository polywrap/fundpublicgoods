import Logs from "@/components/Logs";

export default function ProgressPage(props: {
  params: {
    runId: string
  }
}) {
  return (
    <div className="w-full flex justify-center h-full p-16">
      <Logs runId={props.params.runId} />
    </div>
  )
}