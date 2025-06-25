"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Button from "./button";
import Card from "./card";
import GithubIcon from "./icons/github-icon";

type githubApi = {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string;
};

export default function GithubCardClient({ user }: { user: githubApi }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      viewport={{ once: true }}
    >
      <Card className="w-96 h-44 mr-10 flex justify-between items-center">
        <div>
          <p className="mb-3">
            <GithubIcon size={24} />
          </p>
          <p className="text-xl">{user.name || user.login}</p>
          <p className="mb-4 text-sm text-secondarytext">{user.login}</p>
          <Button href={user.html_url || "#"}>Github</Button>
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
    </motion.div>
  );
}
