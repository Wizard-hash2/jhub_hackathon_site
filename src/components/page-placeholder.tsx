import { CoHostBadge } from "./co-host-badge";

export function PagePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pb-24 pt-24 text-center sm:px-6">
      <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-md text-mist">{description}</p>
      <div className="mt-8">
        <CoHostBadge />
      </div>
    </div>
  );
}
