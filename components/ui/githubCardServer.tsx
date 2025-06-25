import GithubCardClient from "./githubCardClient";

type githubApi = {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string;
};

async function fetchGithubUser(username: string): Promise<githubApi | null> {
  const res = await fetch(`https://api.github.com/users/${username}`, {
    cache: "force-cache",
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;

  return res.json();
}

export default async function GithubCardServer({
  username,
}: {
  username: string;
}) {
  const user = await fetchGithubUser(username);
  if (!user) return null;

  return <GithubCardClient user={user} />;
}
