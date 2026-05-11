import PollEmbed from "./PollEmbed";

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PollEmbed pollId={id} />;
}
