import Card from "./card";

export function GithubCardSkeleton() {
  return (
    <Card className="w-96 h-44 mr-10 flex justify-between items-center">
      <div>
        <div className="mb-3 w-6 h-6 rounded-full bg-gray-300" />
        <div className="mb-3 bg-gray-300 w-24 h-4 rounded-md" />
        <div className="mb-3 bg-gray-300 w-24 h-4 rounded-md" />
        <div className="w-24 h-10 rounded-md py-2 px-4 bg-gray-300" />
      </div>
      <div>
        <div className="w-32 h-32 rounded-full bg-gray-300" />
      </div>
    </Card>
  );
}
