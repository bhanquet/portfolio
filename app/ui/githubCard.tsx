import Image from "next/image";
import Button from "./button";
import Card from "./card";
import Github from "./icons/github";

interface githubApi {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string;
}

async function fetchGithubUser(username: string): Promise<githubApi | null> {
  const res = await fetch(`https://api.github.com/users/${username}`, {
    cache: "force-cache",
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function GithubCard({ username }: { username: string }) {
  const user = await fetchGithubUser(username);

  return (
    <Card className="w-96 h-44 mr-10 flex justify-between items-center">
      <div>
        <p className="mb-3">
          <Github size={24} />
        </p>
        <p className="text-xl">{user?.name || username}</p>
        <p className="mb-4 text-sm text-secondarytext">{username}</p>
        <Button href={user?.html_url || "#"}>Github</Button>
      </div>
      <div>
        {user && (
          <Image
            src={user.avatar_url}
            width={128}
            height={128}
            alt={`${user.login} githubAvatar`}
            className="rounded-full"
          />
        )}
      </div>
    </Card>
  );
}
