import TrialStage from "@/components/TrialStage";

export default function TrialPage({ searchParams }: { searchParams: { topic?: string } }) {
  const topic = searchParams.topic?.trim() ?? "";
  return <TrialStage topic={topic} />;
}
